import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"

export class Modifier extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      source: new fields.DocumentUUIDField(),
      type: new fields.StringField({ required: true, choices: SYSTEM.MODIFIER_TYPES, initial: "equipment" }),
      subtype: new fields.StringField({ required: true, choices: SYSTEM.MODIFIER_SUBTYPES, initial: "ability" }),
      target: new fields.StringField({ required: true, choices: SYSTEM.MODIFIER_TARGETS, initial: "agi" }),
      value: new fields.StringField({ required: true, initial: "0" }),
    }
  }

  /**
   * Update the source of the modifier
   * @param {*} source
   */
  updateModifierSource(source) {
    this.source = source
  }

  /**
   * Evaluates the given actor using the specified value and source.
   *
   * @param {Object} actor The actor to be evaluated.
   * @returns {int} The result of the evaluation.
   */
  evaluate(actor) {
    return Utils.evaluate(actor, this.value, this.source, true)
  }

  /**
   * Asynchronously retrieves a tooltip for a given actor.
   *
   * @param {Object} actor The actor for which the tooltip is being generated.
   * @returns {Promise<string|undefined>} A promise that resolves to the tooltip string, or undefined if the item is not found.
   */
  getTooltip(actor) {
    const { id } = foundry.utils.parseUuid(this.source)
    let item = actor.items.get(id)
    if (!item) return
    let name = item.name
    let value = this.evaluate(actor)
    return Utils.getTooltip(name, value)
  }

  /**
   * Retrieves the source information for a given actor.
   * Pour un objet appartenant à un acteur, la source est l'id de l'objet (embedded item) ou du type Actor.id.Item.id
   * Retourne Le nom et la description de l'objet à l'origine du modifier
   *
   * @param {Object} actor The actor object containing items.
   * @returns {Object|undefined} An object containing the name and description of the item, or undefined if the item is not found.
   * @property {string} name - The name of the item.
   * @property {string} description - The description of the item.
   */
  getSourceInfos(actor) {
    const { id } = foundry.utils.parseUuid(this.source)
    let item = actor.items.get(id)
    if (!item) return
    const name = item.name
    const description = item.system.description
    return { name, description }
  }
}
