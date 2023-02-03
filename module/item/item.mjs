import { ITEM_TYPE } from "../system/constants.mjs";
/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class CoItem extends Item {
  constructor(...args) {
    let data = args[0];
    
    super(...args);
}



  /** @override */
  prepareBaseData() {
    this.system.slug = this.name.slugify({ strict: true });
    // switch (this.type) {
    //   case ITEM_TYPE.PATH:
    //     return this._preparePathData();
    // }
  }

  /**
   *
   */
  // _preparePathData() {
  //   this.system.maxRank = PATH_MAX_RANK;
  // }

  /**
  * @returns undefined if the item is not a trait, true if the item has modifiers
  * @type {boolean}
  */
  get hasModifiers() {
    if (![ITEM_TYPE.FEATURE, ITEM_TYPE.TRAIT, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;

    // Array
    if (this.system.modifiers?.length > 0) return true;
    // Object
    if (this.system.modifiers !== null) return true;
  }

  /**
   * Return an array of Modifiers
   */
  get modifiers() {
    if (!this.hasModifiers) return [];
    if (this.system.modifiers instanceof Array) return this.system.modifiers;
    return Object.values(this.system.modifiers);
  }

  // /**
  //  * @returns undefined if the tiem is not a specie or a path, null if there is no capacities already, all the capacities
  //  * @type {boolean}
  //  */
  // get allCapacities() {
  //   if (!this.type == ITEM_TYPE.SPECIE && !this.type == ITEM_TYPE.PATH) return undefined;
  //   // No capacities
  //   if (this.system.capacities === undefined) return null;
  //   return this.system.capacities;
  // }

   /**
    * @description Calculate the sum of all bonus for a specific type and target
    * @param {*} type      MODIFIER_TYPE
    * @param {*} subtype   MODIFIER_SUBTYPE
    * @param {*} target    MODIFIER_TARGET
    * @returns the value of the bonus
    */
   getTotalModifiersByTypeSubtypeAndTarget(type, subtype, target) {
     if (![ITEM_TYPE.TRAIT, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;
     if (!this.hasModifiers) return 0;
     return this.system.modifiers
       .filter(m => m.type == type && m.subtype == subtype && m.target == target)
       .map(i => i.modifier)
       .reduce((acc, curr) => acc + curr, 0);
   }

      /**
    * @description Calculate the sum of all bonus for a specific type and target
    * @param {*} type trait
    * @param {*} target For trait type, target are str, dex, etc...
    * @returns the value of the bonus
    */
       getModifiersByTypeAndSubtype(type, subtype) {
        if (![ITEM_TYPE.TRAIT, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;
        if (!this.hasModifiers) return 0;
        return this.system.modifiers.filter((m) => m.type == type && m.subtype == subtype);
      }

  // /**
  //  *
  //  * @param {*} source
  //  * @returns true if the capacity with a same source already exists
  //  * @type {boolean}
  //  */
  // hasCapacityBySource(source) {
  //   if (this.allCapacities != null && this.allCapacities.find((capacity) => capacity.source == source)) return true;
  //   return false;
  // }

    get actions() {
        if (this.system.actions instanceof Array) return this.system.actions;
        return Object.values(this.system.actions);
    }

}
