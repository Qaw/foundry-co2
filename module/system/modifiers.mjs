import { MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE } from "./constants.mjs";

export class Modifiers {
  /**
   * @description Get all modifiers object from an array of items
   * @param {CoItem[]} items
   * @param {*} type MODIFIER_TYPE
   * @param {*} subtype MODIFIER_SUBTYPE
   * @returns {Modifier[]} all the modifiers
   */
  static getModifiersByTypeSubtype(items, type, subtype) {
    if (items.size == 0) return [];

    /* FIXME Je repasse par un état intermeédiaire parce que via macro je n'avais plus un Array de Modifier mais un Array de Object, et donc l'appel à evaluate() merdait plus loin
    let modifiers = [];
    let newMod = [];
    
    items.forEach(element => {
        newMod.push(...element.modifiers.filter(m => m.type === type && m.subtype === subtype));
     });
     newMod.forEach(element => {
       let elt = new Modifier(element.type, element.subtype, element.source, element.target, element.value);
       modifiers.push(elt);
     });
     return modifiers;
     */
    let result = items
      .reduce((mods, item) => mods.concat(item.modifiers), [])
      .filter((m) => m.type === type && m.subtype === subtype)
      .map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value));
    return result;
  }

  /**
   * @param {*} actor 
   * @param {*} modifiers array of Modifier objects
   * @param {MODIFIER_TARGET} target
   * @returns the sum of the modifier value for each Modifier
   */
  static computeTotalModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return 0;
    let total = modifiers
      .filter((m) => m.target === target)
      .map((i) => i.evaluate(actor))
      .reduce((acc, curr) => acc + curr, 0);
    return total;
  }

  /**
   * 
   * @param {*} actor 
   * @param {*} modifiers array of Modifier objects
   * @param {MODIFIER_TARGET} target 
   * @returns the tooltip which aggregates all modifiers if the value is > 0
   */
  static getTooltipModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return "";
    let modifiersByTarget = modifiers.filter((m) => m.target === target);
    let tooltip = "";
    modifiersByTarget.forEach((modifier) => {

      /*let name = this._getNameBySource(element);
      if (name !== "" && element.evaluate(actor) > 0) {
        tooltip += name + " : " + element.evaluate(actor) + " ";
      }*/
      let partialTooltip = modifier.getTooltip(actor);
      if (partialTooltip !== null) tooltip += partialTooltip;
    });
    return tooltip;
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
    if (this.value === "") return 0;
    if (this.value.includes("@")) return this._evaluateCustom(actor);
    const resultat = parseInt(this.value);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

  /**
   * @description Evaluate a custom value
   * It could be @rank{x,x,x,x,x} or @level
   * @param {*} actor 
   * @returns {int} the modifier's value
   */
  _evaluateCustom(actor) {
    let value = 0;
    if (!this.value.includes("@")) return value;
    // @levek
    if (this.value.includes("@level")) {
      let formula = this.value.replace("@level", actor.system.attributes.level.value);
      value += eval(formula);
    }
    // @rank
    if (this.value.includes("@rank")){
      // @rank{+1,0,+1,0,0}
      let startRank = this.value.substring(this.value.indexOf("@rank"));
      let extract = startRank.substring(this.value.indexOf("{") +1, this.value.indexOf("}"));
      let ranks = extract.split(',');
      let itemSource = fromUuidSync(this.source);
      let rank = itemSource.system.rank;
      value = parseInt(ranks[rank-1]);
    }
    return value;
  }

  getTooltip(actor) {
    let name = this._getNameBySource();
    let value = this.evaluate(actor);
    if (name !== "" &&  value > 0) {
      return name + " : " + value + " ";
    }
    return null;
  }

  /**
   * 
   * @returns {String} the item's name or an empty string
   */
  _getNameBySource() {
    const item = this._getItemFromSource();
    if (item) return item.name;
    return "";
  }

  _getItemFromSource() { 
    return fromUuidSync(this.source);
  }
}
