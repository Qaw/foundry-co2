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
   * Resolver pour les actions de type Attaque
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action
   * @param {("attack"|"damage")} type : type de resolver
   */
  async melee(actor, item, action, type) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - melee`), actor, item, action, type)

    // TODO : Gérer la difficulté de l'action
    /*
    const diffToEvaluate = this.skill.difficulty.match("[0-9]{0,}[d|D][0-9]{1,}")    
    if (diffToEvaluate) {
      difficulty = Utils.evaluateWithDice(actor, this.skill.difficulty, item.uuid)
    } else {
      difficulty = Utils.evaluate(actor, this.skill.difficulty, item.uuid, true)
    }
    */
    let difficulty = ""

    const critical = this.skill.crit === "" ? actor.system.combat.crit.value : this.skill.crit

    let skillFormula = this.skill.formula
    skillFormula = Utils.evaluateFormulaCustomValues(actor, skillFormula)
    let skillFormulaEvaluated = Roll.replaceFormulaData(skillFormula, actor.getRollData())

    let damageFormula = this.dmg.formula
    damageFormula = Utils.evaluateFormulaCustomValues(actor, damageFormula)
    let damageFormulaEvaluated = Roll.replaceFormulaData(damageFormula, actor.getRollData())

    await actor.rollAttack(item, { auto: false, type, actionName: action.label, skillFormula: skillFormulaEvaluated, damageFormula: damageFormulaEvaluated, critical, difficulty })
  }

  /**
   * Resolver pour les actions de type Attaque automatique
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action
   */
  async auto(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - auto`), actor, item, action)

    let damageFormula = this.dmg.formula
    damageFormula = Utils.evaluateFormulaCustomValues(actor, damageFormula)
    let damageFormulaEvaluated = Roll.replaceFormulaData(damageFormula, actor.getRollData())

    await actor.rollAttack(item, { auto: true, type: "damage", actionName: action.label, damageFormula: damageFormulaEvaluated })
  }

  /**
   * Resolver pour les actions de type Soin
   * @param {COActor} actor : l'acteur pour lequel s'applique l'action
   * @param {COItem} item : la source de l'action
   * @param {Action} action : l'action.
   */
  async heal(actor, item, action) {
    if (CONFIG.debug.co?.resolvers) console.debug(Utils.log(`Resolver - heal`), actor, item, action)

    let healFormula = this.skill.formula
    healFormula = Utils.evaluateFormulaCustomValues(actor, healFormula)
    let healFormulaEvaluated = Roll.replaceFormulaData(healFormula, actor.getRollData())

    await actor.rollHeal(item, { actionName: action.label, healFormula: healFormulaEvaluated })
  }
}
