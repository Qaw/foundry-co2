import { MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE } from "./constants.mjs";
import { Utils } from "./utils.mjs";

export class Modifiers {
  /**
   * @description Get all modifiers object from an array of items
   * @param {CoItem[]} items
   * @param {*} type MODIFIER_TYPE
   * @param {*} subtype MODIFIER_SUBTYPE
   * @returns {Modifier[]} all the modifiers
   */
  static getModifiersByTypeSubtype(items, type, subtype) {
    if (!items || items.size == 0) return [];
    return items
      .reduce((mods, item) => mods.concat(item.modifiers), [])
      .filter((m) => m.type === type && m.subtype === subtype)
      .map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value));
  }

  /**
   * @param {*} actor
   * @param {*} modifiers array of Modifier objects
   * @param {MODIFIER_TARGET} target
   * @returns the sum of the modifier value for each Modifier
   */
  static computeTotalModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return { total: 0, tooltip: "" };
    let modifiersByTarget = modifiers.filter((m) => m.target === target);

    let total = modifiersByTarget.map((i) => i.evaluate(actor)).reduce((acc, curr) => acc + curr, 0);

    let tooltip = "";
    modifiersByTarget.forEach((modifier) => {
      let partialTooltip = modifier.getTooltip(actor);
      if (partialTooltip !== null) tooltip += partialTooltip;
    });

    return { total: total, tooltip: tooltip };
  }
}

export class Modifier {
  /**
   *
   * @param {*} type      MODIFIER_TYPE
   * @param {*} subtype   MODIFIER_SUBTYPE
   * @param {*} source    UUID of the source
   * @param {*} target    MODIFIER_TARGET
   * @param {*} value     +/- X or custom like 2*@rank
   */
  constructor(source = null, type = MODIFIER_TYPE.CAPACITY, subtype = MODIFIER_SUBTYPE.ABILITY, target = MODIFIER_TARGET.STR, value = null) {
    this.source = source;
    this.type = type;
    this.subtype = subtype;
    this.target = target;
    this.value = value;
  }

  /**
   *
   * @param {*} actor
   * @returns {int} the modifier's value
   */
  evaluate(actor) {
    return Utils.evaluate(actor, this.value, this.source);

    /*if (this.value === "") return 0;
    if (this.value.includes("@") || this.value.includes("#")) return this._evaluateCustom(actor);
    const resultat = parseInt(this.value);
    if (isNaN(resultat)) return 0;
    return resultat;*/
  }
  
  getTooltip(actor) {
    let name = this.sourceName;
    let value = this.evaluate(actor);

    return Utils.getTooltip(name, value);
  }

  /**
 *
 * @returns {String} the item's name or an empty string
 */
  get sourceName() {
    const item = this._getItemFromSource();
    return item ? item.name : "";
  }

  get sourceDescription() {
    const item = this._getItemFromSource();
    return item ? item.system.description.value : "";
  }

  _getItemFromSource() {
    return fromUuidSync(this.source);
  }
}
