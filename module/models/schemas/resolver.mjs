import { SYSTEM } from "../../config/system.mjs"
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
 */
export class Resolver extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      type: new fields.StringField({ required: true, initial: "auto" }),
      skill: new fields.ObjectField(),
      dmg: new fields.ObjectField(),
      target: new fields.SchemaField({
        type: new fields.StringField({ required: true, choices: SYSTEM.RESOLVER_TARGET, initial: SYSTEM.RESOLVER_TARGET.none.id }),
        number: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        scope: new fields.StringField({ required: true, choices: SYSTEM.RESOLVER_SCOPE, initial: SYSTEM.RESOLVER_SCOPE.all.id }),
      }),
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
      case "ranged":
      case "magical":
        this.attack(actor, item, action, type)
        return true
      case "auto":
        this.auto(actor, item, action)
        return true
      case "heal":
        this.heal(actor, item, action)
        return true
      case "consumable":
        this.consume(actor, item, action)
        return true
      default:
        return false
    }
  }

  /**
   * Resolver pour les actions de type Attaque
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action
   * @param {("attack"|"damage")} type : type de resolver
   */
  async attack(actor, item, action, type) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver attack`), actor, item, action, type)

    const displayDifficulty = game.settings.get("co", "displayDifficulty")
    const showDifficulty = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM)

    let difficulty = this.skill.difficulty
    // Si la difficulté dépend de la cible
    let targets = []
    if (difficulty.includes("@target")) {
      targets = this.acquireTargets(actor, "single", "all", action)
      if (targets.length > 0) {
        // Enlève le target. de la difficulté
        difficulty = difficulty.replace(/@.*\./, "@")
        difficulty = Roll.replaceFormulaData(difficulty, targets[0].actor.getRollData())
      }
    }

    const critical = this.skill.crit === "" ? actor.system.combat.crit.value : this.skill.crit

    let skillFormula = this.skill.formula
    skillFormula = Utils.evaluateFormulaCustomValues(actor, skillFormula, item.uuid)
    let skillFormulaEvaluated = Roll.replaceFormulaData(skillFormula, actor.getRollData())
    const skillFormulaTooltip = this.skill.formula

    let damageFormula = this.dmg.formula
    damageFormula = Utils.evaluateFormulaCustomValues(actor, damageFormula, item.uuid)
    let damageFormulaEvaluated = Roll.replaceFormulaData(damageFormula, actor.getRollData())
    const damageFormulaTooltip = this.dmg.formula

    await actor.rollAttack(item, {
      auto: false,
      type,
      actionName: action.label,
      skillFormula: skillFormulaEvaluated,
      damageFormula: damageFormulaEvaluated,
      skillFormulaTooltip,
      damageFormulaTooltip,
      critical,
      difficulty,
      showDifficulty,
    })
  }

  /**
   * Resolver pour les actions de type Attaque automatique
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action
   */
  async auto(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver auto`), actor, item, action)

    let damageFormula = this.dmg.formula
    damageFormula = Utils.evaluateFormulaCustomValues(actor, damageFormula)
    let damageFormulaEvaluated = Roll.replaceFormulaData(damageFormula, actor.getRollData())
    const damageFormulaTooltip = this.dmg.formula

    await actor.rollAttack(item, { auto: true, type: "damage", actionName: action.label, damageFormula: damageFormulaEvaluated, damageFormulaTooltip })
  }

  /**
   * Resolver pour les actions de type Soin
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action.
   */
  async heal(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver heal`), actor, item, action)

    let healFormula = this.skill.formula
    healFormula = Utils.evaluateFormulaCustomValues(actor, healFormula)
    let healFormulaEvaluated = Roll.replaceFormulaData(healFormula, actor.getRollData())

    const targets = this.acquireTargets(actor, this.target.type, this.target.scope, action)
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log("Heal Targets", targets))

    await actor.rollHeal(item, { actionName: action.label, healFormula: healFormulaEvaluated, targetType: this.target.type, targets: targets })
  }

  /**
   * Resolver pour les actions de type Consommer. Va simplement consommer un item
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action.
   */
  async consume(actor, item, action) {
    let quantity = item.system.quantity.current - 1
    if (quantity === 0 && item.system.quantity.destroyIfEmpty) {
      await actor.deleteEmbeddedDocuments("Item", [item.id])
    } else {
      await item.update({ "system.quantity.current": quantity })
    }
    return true
  }

  /**
   * Extracts target information from a given token.
   *
   * @param {Object} token The token object containing actor and name information.
   * @param {Object} token.actor The actor associated with the token.
   * @param {string} token.actor.uuid The unique identifier of the actor.
   * @param {string} token.name The name of the token.
   * @returns {Object} An object containing the token, actor, actor's UUID, and token's name.
   * @private
   */
  static #getTargetFromToken(token) {
    return { token, actor: token.actor, uuid: token.actor.uuid, name: token.name }
  }

  /**
   * Acquire targets based on the specified target type and scope.
   *
   * @param {Object} actor The actor performing the action.
   * @param {string} targetType The type of target to acquire. Can be "none", "self", "single", or "multiple".
   * @param {string} targetScope The scope of the target acquisition.
   * @param {Object} action The action to be performed on the targets.
   * @param {Object} [options={}] Additional options for target acquisition.
   * @returns {Array} An array of acquired targets.
   * @throws {Error} Throws an error if any target has an error.
   */
  acquireTargets(actor, targetType, targetScope, action, options = {}) {
    if (!canvas.ready) return []
    let targets

    switch (targetType) {
      case "none":
        return []
      case "self":
        targets = actor.getActiveTokens(true).map(Resolver.#getTargetFromToken)
        break
      case "single":
        targets = this.#getTargets(action, targetScope, true)
        break
      case "multiple":
        targets = this.#getTargets(action, targetScope, false)
        break
    }

    // Throw an error if any target had an error
    for (const target of targets) {
      if (target.error) throw new Error(target.error)
    }
    return targets
  }

  #getTargets(action, scope, single) {
    const tokens = game.user.targets
    let errorAll

    // Too few targets
    if (tokens.size < 1) {
      return []
    }

    // Too many targets
    if ((single && tokens.size > 1) || (!single && tokens.size > this.target.number)) {
      errorAll = game.i18n.format("CO.notif.warningIncorrectTargets", {
        number: single ? 1 : this.target.number,
        action: action.label,
      })
    }

    // Test each target
    const targets = []
    for (const token of tokens) {
      const t = Resolver.#getTargetFromToken(token)
      if (errorAll) t.error = errorAll
      if (scope === "allies" && t.token.document.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) targets.push(t)
      else if (scope === "enemies" && t.token.document.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) targets.push(t)
      else if (scope === "all") targets.push(t)
      if (!this.token) continue
      if (token === this.token) {
        t.error = game.i18n.localize("CO.notif.warningCannotTargetSelf")
        continue
      }
    }
    return targets
  }
}
