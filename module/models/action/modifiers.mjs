import { MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE } from "../../system/constants.mjs";
import { Utils } from "../../system/utils.mjs";

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
      .reduce((mods, item) => mods.concat(item.enabledModifiers), [])
      .filter((m) => m.type === type && m.subtype === subtype)
      .map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value));
  }

  /**
   * @name computeTotalModifiersByTarget
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
   * @param {*} source    UUID of the source
   * @param {*} type      MODIFIER_TYPE
   * @param {*} subtype   MODIFIER_SUBTYPE
   * @param {*} target    MODIFIER_TARGET
   * @param {*} value     +/- X or custom like 2*@rank
   */
  constructor(source = null, type, subtype, target, value = null) {
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
    return Utils.evaluate(actor, this.value, this.source, true);
  }
  
  /**
   * @param {*} actor 
   * @returns 
   */
  getTooltip(actor) {
    let item = actor.items.get(this.source);
    if (!item) return;
    let name = item.name;
    let value = this.evaluate(actor);
    return Utils.getTooltip(name, value);
  }

  /**
   * Update the source of the modifier
   * @param {*} source 
   */
  updateSource(source) {
      this.source = source;
  }

  /**
   * Pour un objet appartenant à un acteur, la source est l'id de l'objet (embedded item) ou du type Actor.id.Item.id
  * @param {*} actor 
   * @returns Le nom et la description de l'objet à l'origine du modifier
   */
  getSourceInfos(actor) {
    let item;
    if (this.source.startsWith("Actor.")) item = actor.items.get(this.extraireItemId(this.source));
    else item = actor.items.get(this.source);
    if (!item) return;
    const name = item.name;
    const description = item.system.common.description;
    return {name, description};
  }

  extraireItemId(chaine) { 
    // Divise la chaîne en segments en utilisant le caractère '.'
    const segments = chaine.split('.');
  
    // Récupère le dernier élément du tableau
    const dernierID = segments[segments.length - 1];
  
    return dernierID;
  }
}
