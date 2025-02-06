import Utils from "../../utils.mjs"
import { CoAttackCheck } from "../../system/roll.mjs"

/**
 * Resolver
 *
 * @class
 * @param {string} type The type of the action.
 * @param {number} skill The skill level required for the action.
 * @param {number} dmg The damage value of the action.
 * @param {Actor} target La cible de l'action
 */
export class Resolver extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      type: new fields.StringField({ required: true, initial: "auto" }),
      skill: new fields.ObjectField(),
      dmg: new fields.ObjectField(),
      target: new fields.ObjectField(),
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
   *
   * @param {*} actor : l'acteur pour lequel s'applique l'action
   * @param {*} item : la source de l'action
   * @param {*} action : l'action
   * @param {*} type : type de resolver (attack or damage)
   */
  async melee(actor, item, action, type) {
    const auto = false

    const itemName = item.name
    const actionName = action.label

    const skillFormula = this.skill.formula[0].part
    const crit = actor.system.combat.crit.value
    const diffToEvaluate = this.skill.difficulty.match("[0-9]{0,}[d|D][0-9]{1,}")
    let diff = ""
    if (diffToEvaluate) {
      diff = Utils.evaluateWithDice(actor, this.skill.difficulty, item.uuid)
    } else {
      diff = Utils.evaluate(actor, this.skill.difficulty, item.uuid, true)
    }
    const skillFormulaToEvaluate = !skillFormula.match("[0-9]{0,}[d|D][0-9]{1,}")
    // TODO let skillFormulaEvaluated = skillFormulaToEvaluate ? Utils.evaluate(actor, skillFormula, item.uuid, true) : Utils.evaluateWithDice(actor, skillFormula, item.uuid)
    let skillFormulaEvaluated = Roll.replaceFormulaData(skillFormula, actor.getRollData())

    const damageFormula = this.dmg.formula[0].part
    const damageFormulaToEvaluate = !damageFormula.match("[0-9]{0,}[d|D][0-9]{1,}")
    let damageFormulaEvaluated = damageFormulaToEvaluate ? Utils.evaluate(actor, damageFormula, item.uuid, true) : Utils.evaluateWithDice(actor, damageFormula, item.uuid)

    new CoAttackCheck(actor, item).init({
      auto,
      type,
      itemName,
      actionName,
      skillFormula,
      skillFormulaToEvaluate,
      skillFormulaEvaluated,
      damageFormula,
      damageFormulaToEvaluate,
      damageFormulaEvaluated,
      crit,
      diff,
    })
  }

  async auto(actor, item, action) {
    console.log(actor)
    console.log(item)
    console.log(action)
    const itemName = item.name
    const actionName = action.label
    const damageFormula = this.dmg.formula[0].part
    const auto = true
    const type = "damage"

    let damageFormulaEvaluated = damageFormula.match("[0-9]{0,}[d|D][0-9]{1,}")
      ? Utils.evaluateWithDice(actor, damageFormula, item.uuid)
      : Utils.evaluate(actor, damageFormula, item.uuid)
    new CoAttackCheck(actor, item).init({ auto, type, itemName, actionName, damageFormulaEvaluated })
  }

  /**
   * Applique les soins sur l'acteur ciblé
   * @param {*} actor : l'acteur ciblé
   * @param {*} item : l'element contenant l'action (ex : capacity)
   * @param {*} action : l'action à l'origine du soin
   */
  async heal(actor, item, action) {
    console.log("passage dans heal")
    console.log(actor)
    console.log(item)
    console.log(action)
    const itemName = item.name
    const actionName = action.label
    const healFormula = this.dmg.formula[0].part
    const type = "heal"

    let healFormulaEvaluated = healFormula.match("[0-9]{0,}[d|D][0-9]{1,}") ? Utils.evaluateWithDice(actor, healFormula, item.uuid) : Utils.evaluate(actor, healFormula, item.uuid)
    let r = new Roll(healFormulaEvaluated)
    await r.roll()
    const result = r.terms[0].results.find((r) => r.active).result
    if (parseInt(result)) {
      actor.system.attributes.hp.value += parseInt(result)
      if (actor.system.attributes.hp.value > actor.system.attributes.hp.max) actor.system.attributes.hp.value = actor.system.attributes.hp.max
      actor.update({ "system.attributes.hp.value": actor.system.attributes.hp.value })
    }
  }
}
