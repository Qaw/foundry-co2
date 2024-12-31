import { SYSTEM } from "../../config/system.mjs"
import { Modifier } from "../schemas/modifier.mjs"

export class Modifiers {
  /**
   * Get all modifiers object from an array of items
   * @param {CoItem[]} items
   * @param {*} type SYSTEM.MODIFIER_TYPE
   * @param {*} subtype SYSTEM.MODIFIER_SUBTYPE
   * @returns {Modifier[]} all the modifiers
   */
  static getModifiersByTypeSubtype(items, type, subtype) {
    if (!items || items.length === 0) return []
    let allModifiers = items.reduce((mods, item) => mods.concat(item.enabledModifiers), []).filter((m) => m.type === type && m.subtype === subtype)
    //   .map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value))
    return allModifiers
  }

  /**
   * Get all modifiers object from an array of items
   * @param {Object} actor The actor for which the modifiers are evaluated.
   * @param {Array} modifiers An array of modifier objects.
   * @param {SYSTEM.MODIFIERS.MODIFIER_TARGET} target The target for which the modifiers are filtered.
   * @returns {Object} An object containing the total of the evaluated modifiers and a concatenated tooltip string.
   * {number} returns.total - The sum of the evaluated modifiers.
   * {string} returns.tooltip - The concatenated tooltip string from all relevant modifiers.
   */
  static computeTotalModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return { total: 0, tooltip: "" }
    let modifiersByTarget = modifiers.filter((m) => m.target === target)

    let total = modifiersByTarget.map((i) => i.evaluate(actor)).reduce((acc, curr) => acc + curr, 0)

    let tooltip = ""
    for (const modifier of modifiersByTarget) {
      let partialTooltip = modifier.getTooltip(actor)
      if (partialTooltip !== null) tooltip += partialTooltip
    }

    return { total: total, tooltip: tooltip }
  }
}
