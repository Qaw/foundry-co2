import Utils from "../../utils.mjs"
import COActor from "../../documents/actor.mjs"

/**
 * Resolver
 *
 * @class
 * @param {string} type Le type d'action.
 * @param {number} skill Le niveau de skill requis pour l'action ? ou la formule de skill a utiliser (attaque)
 *  skill.difficulty skill.formula (array)
 * @param {number} dmg La valeur de dégâts ou de soin de l'action.
 * @param {string} target Le type de cible de l'action : self, character, encounter
 * @param {boolean} isMultiTarget Est-ce pour une cible unique (false) ou multiple (true) ?
 */
export class Resolver extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      type: new fields.StringField({ required: true, initial: "auto" }),
      skill: new fields.ObjectField(),
      dmg: new fields.ObjectField(),
      target: new fields.StringField(),
      isMultiTarget: new fields.BooleanField(),
    }
  }

  get resolvers() {
    return {
      melee: function () {},
      ranged: function () {},
      heal: function () {},
      modifier: function () {},
      auto: function () {},
    }
  }

  resolve(actor, item, action, type) {
    switch (this.type) {
      case "melee":
        this.melee(actor, item, action, type)
        return true
      case "auto":
        this.auto(actor, item, action)
        return true
      case "heal":
        this.heal(actor, item, action)
        return true
      default:
        return false
    }
  }

  /**
   * Resolver pour les actions de type melee
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action
   * @param {("attack"|"damage")} type : type de resolver
   */
  async melee(actor, item, action, type) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - melee`), actor, item, action, type)

    const auto = false
    const actionName = action.label

    const diffToEvaluate = this.skill.difficulty.match("[0-9]{0,}[d|D][0-9]{1,}")
    let difficulty = ""
    if (diffToEvaluate) {
      difficulty = Utils.evaluateWithDice(actor, this.skill.difficulty, item.uuid)
    } else {
      difficulty = Utils.evaluate(actor, this.skill.difficulty, item.uuid, true)
    }

    const critical = this.skill.crit === "" ? actor.system.combat.crit.value : this.skill.crit

    const skillFormula = this.skill.formula
    let skillFormulaEvaluated = Roll.replaceFormulaData(skillFormula, actor.getRollData())

    const damageFormula = this.dmg.formula
    let damageFormulaEvaluated = Roll.replaceFormulaData(damageFormula, actor.getRollData())

    await actor.rollAttack(item, { auto, type, actionName, skillFormula: skillFormulaEvaluated, damageFormula: damageFormulaEvaluated, critical, difficulty })
  }

  /**
   * Résout automatiquement une action effectuée par un acteur sur un objet.
   *
   * @param {Object} actor L'acteur effectuant l'action.
   * @param {Object} item L'objet impliqué dans l'action.
   * @param {Object} action L'action en cours d'exécution.
   * @returns {Promise<void>} Une promesse qui se résout lorsque l'action est terminée.
   */
  async auto(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - auto`), actor, item, action)
    const itemName = item.name
    const actionName = action.label
    const damageFormula = this.dmg.formula[0].part
    const auto = true
    const type = "damage"

    let damageFormulaEvaluated = damageFormula.match("[0-9]{0,}[d|D][0-9]{1,}")
      ? Utils.evaluateWithDice(actor, damageFormula, item.uuid)
      : Utils.evaluate(actor, damageFormula, item.uuid)

    await actor.rollAttack(item, { auto, type, actionName, damageFormula: damageFormulaEvaluated })
  }

  /**
   * Applique les soins sur l'acteur ciblé
   * @param {*} actor : l'acteur ciblé
   * @param {*} item : l'element contenant l'action (ex : capacity)
   * @param {*} action : l'action à l'origine du soin
   */
  async heal(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - heal`), actor, item, action)
    const itemName = item.name
    const actionName = action.label
    const healFormula = this.dmg.formula[0].part
    const type = "heal"
    const cible = this.target

    let healFormulaEvaluated = healFormula.match("[0-9]{0,}[d|D][0-9]{1,}") ? Utils.evaluateWithDice(actor, healFormula, item.uuid) : Utils.evaluate(actor, healFormula, item.uuid)
    let r = new Roll(healFormulaEvaluated)
    await r.roll()

    const result = r.total
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - heal - result`), r, result)

    switch (cible) {
      // L'acteur se soigne lui même
      case "self":
        let newValue = Math.min(actor.system.attributes.hp.value + result, actor.system.attributes.hp.max)
        actor.update({ "system.attributes.hp.value": newValue })
        break
      // On envoie un message à la cible pour lui proposer de se soigner via un message chat
      case "character":
        if (game.user.targets.size === 0) {
          throw new Error(game.i18n.localize("co.ui.noTarget"))
        }
        if (this.isMultiTarget) {
          const targetedTokens = Array.from(game.user.targets)
          targetedTokens.forEach((token) => {
            game.socket.emit(`system.${SYSTEM.id}`, {
              action: "heal",
              data: {
                toUserId: targetedTokens.actor.id,
                healAmount: result,
                fromUserId: actor.id,
                resolver: this,
                targets: [targetedTokens.actor.id],
              },
            })
          })
        } else {
          const targetedToken = game.user.targets[0]
          game.socket.emit(`system.${SYSTEM.id}`, {
            action: "heal",
            data: {
              toUserId: targetedToken.actor.id,
              healAmount: result,
              fromUserId: actor.id,
              resolver: this,
              targets: [targetedToken.actor.id],
            },
          })
        }
        break
      // On envoie un message au maitre de jeu pour appliquer les effets sur des créatures
      case "encounter":
        if (game.user.targets.size === 0) {
          throw new Error(game.i18n.localize("co.ui.noTarget"))
        }
        const GM = game.users.find((user) => user.isGM)
        if (GM) {
          // TODO Créer un message chat pour proposer d'appliquer les soins aux creatures
          console.log("devrait envoyer un message au mj pour appliquer les effets")
        }
        break
    }
  }
}
