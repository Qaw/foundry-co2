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

    // FIXME Je repasse par un état intermeédiaire parce que via macro je n'avais plus un Array de Modifier mais un Array de Object, et donc l'appel à evaluate() merdait plus loin
    let modifiers = [];
    let newMod = [];
    items.forEach(element => {
       newMod.push(...element.system.modifiers.filter(m => m.type === type && m.subtype === subtype));      
    });
    newMod.forEach(element => {
      let elt = new Modifier(element.type, element.subtype, element.source, element.target, element.value);
      modifiers.push(elt);
    });

    return modifiers;
  }

  // Modifiers : 
  /**
   * 
   * @param {*} modifiers array of Modifier
   * @param {*} target MODIFIER_TARGET
   * @returns the sum of the modifier value for each Modifier
   */
  static computeTotalModifiersByTarget(actor, modifiers, target) {
    if (!modifiers) return 0;
    let total = modifiers.filter(m => m.target === target)
      .map(i => i.evaluate(actor))
      .reduce((acc, curr) => acc + curr, 0);
    return total;
  }

  static getTooltipModifiersByTarget(modifiers, target) {
    if (!modifiers) return "";
    let modifiersByTarget = modifiers.filter(m => m.target === target);
    let tooltip = "";
    modifiersByTarget.forEach(element => {
      let name = this._getNameBySource(element);
      if (name !== "") tooltip += name + " : " + (element.value > 0 ? "+" + element.value : element.value) + " ";
    });
    return tooltip;
  }

  // source : uuid
  static _getNameBySource(modifier) {
    const item = fromUuidSync(modifier.source);
    if (!item) return "";
    return item.name;
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
  constructor(type, subtype, source, target, value) {
    this.type = type;
    this.subtype = subtype;
    this.source = source;
    this.target = target;
    this.value = value;
  }  

  evaluate(actor) {
    if (this.value === "") return 0;
    if (this.value.includes('@')) return this._evaluateCustom(actor);
    const resultat = parseInt(this.value);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

  // Test avec @level : 2*@level
  _evaluateCustom(actor) {
    console.log('Modifier : value custom evaluation');
    if (!this.value.includes('@')) return 0;
    let formula = this.value.replace('@level', actor.attribute.level.value);
    return eval(formula);
  }

}