import { SYSTEM } from "../../config/system.mjs"
import { Utils } from "../../system/utils.mjs"

export class Modifiers {
  /**
   * Get all modifiers object from an array of items
   * @param {CoItem[]} items
   * @param {*} type SYSTEM.MODIFIER.MODIFIER_TYPE
   * @param {*} subtype SYSTEM.MODIFIER.MODIFIER_SUBTYPE
   * @returns {Modifier[]} all the modifiers
   */
  static getModifiersByTypeSubtype(items, type, subtype) {
    if (!items || items.size === 0) return []
    return items
      .reduce((mods, item) => mods.concat(item.enabledModifiers), [])
      .filter((m) => m.type === type && m.subtype === subtype)
      .map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value))
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Computes the total modifiers and tooltip for a given target.
   *
   * @param {Object} actor The actor for which the modifiers are evaluated.
   * @param {Array} modifiers An array of modifier objects.
   * @param {SYSTEM.MODIFIER.MODIFIER_TARGET} target The target for which the modifiers are filtered.
   * @returns {Object} An object containing the total of the evaluated modifiers and a concatenated tooltip string.
   * @returns {number} returns.total - The sum of the evaluated modifiers.
   * @returns {string} returns.tooltip - The concatenated tooltip string from all relevant modifiers.
   */
  static computeTotalModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return { total: 0, tooltip: "" }
    let modifiersByTarget = modifiers.filter((m) => m.target === target)

    let total = modifiersByTarget.map((i) => i.evaluate(actor)).reduce((acc, curr) => acc + curr, 0)

    let tooltip = ""
    modifiersByTarget.forEach((modifier) => {
      let partialTooltip = modifier.getTooltip(actor)
      if (partialTooltip !== null) tooltip += partialTooltip
    })

    return { total: total, tooltip: tooltip }
  }
}

export class Modifier {
  // eslint-disable-next-line jsdoc/require-description
  /**
   * @param {*} source    UUID of the source
   * @param {SYSTEM.MODIFIER.MODIFIER_TYPE} type
   * @param {SYSTEM.MODIFIER.MODIFIER_SUBTYPE} subtype
   * @param {SYSTEM.MODIFIER.MODIFIER_TARGET} target
   * @param {*} value     +/- X or custom like 2*@rank
   */
  constructor(source = null, type, subtype, target, value = null) {
    this.source = source
    this.type = type
    this.subtype = subtype
    this.target = target
    this.value = value
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
   * Generates a tooltip for a given actor's item.
   *
   * @param {Object} actor The actor object containing items.
   * @returns {string|undefined} - The generated tooltip or undefined if the item is not found.
   */
  getTooltip(actor) {
    let item = actor.items.get(this.source)
    if (!item) return
    let name = item.name
    let value = this.evaluate(actor)
    return Utils.getTooltip(name, value)
  }

  /**
   * Update the source of the modifier
   * @param {*} source
   */
  updateSource(source) {
    this.source = source
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
    let item
    if (this.source.startsWith("Actor.")) item = actor.items.get(this.extraireItemId(this.source))
    else item = actor.items.get(this.source)
    if (!item) return
    const name = item.name
    const description = item.system.description
    return { name, description }
  }

  extraireItemId(chaine) {
    // Divise la chaîne en segments en utilisant le caractère '.'
    const segments = chaine.split(".")

    // Récupère le dernier élément du tableau
    const dernierID = segments[segments.length - 1]

    return dernierID
  }
}
