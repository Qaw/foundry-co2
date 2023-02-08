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
  }

  /**
   * @returns undefined if the item is a path, true if the item has modifiers
   * @type {boolean}
   */
  get hasModifiers() {
    if (![ITEM_TYPE.EQUIPMENT, ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;

    let hasModifiers = false;
    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(this.type)) {
      this.actions.forEach((action) => {
        // Array
        if (action.modifiers?.length > 0) hasModifiers = true;
        // Object
        if (action.modifiers !== null) hasModifiers = true;
      });
    }

    // For Feature or Profile, the modifiers are in the item
    if ([ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE].includes(this.type)) {
      // Array
      if (this.system.modifiers instanceof Array) {
        if (this.system.modifiers.length > 0 ) return true;
        return false;
       }
      // Object
      if (this.system.modifiers !== null) return true;
    }

    return hasModifiers;
  }

  /**
   * Return an array of Modifiers
   */
  get modifiers() {
    if (!this.hasModifiers) return [];

    let modifiers = [];

    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(this.type)) {
      this.actions.forEach((action) => {
        if (action.modifiers) {
          if (action.modifiers instanceof Array) modifiers.push(...action.modifiers);
          else modifiers.push(...Object.values(action.modifiers));
        }
      });
    }

    // For Feature or Profile, the modifiers are in the item
    if ([ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE].includes(this.type)) {
      this.modifiers.forEach((modifier) => {
        modifiers.push(modifier);
      });
    }

    return modifiers;
  }

  /**
   * Return an array of enabled Modifiers
   * If the item has actions, only enabled actions are taken into account
   */
  get enabledModifiers() {
    if (!this.hasModifiers) return [];

    let modifiers = [];

    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(this.type)) {
      this.actions
        .filter((action) => action.properties.enabled)
        .forEach((action) => {
          if (action.modifiers) {
            if (action.modifiers instanceof Array) modifiers.push(...action.modifiers);
            else modifiers.push(...Object.values(action.modifiers));
          }
        });
    }

    // For Feature or Profile, the modifiers are in the item
    if ([ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE].includes(this.type)) {
      this.modifiers.forEach((modifier) => {
        modifiers.push(modifier);
      });
    }

    return modifiers;
  }

  get tags(){
    return this.system.tags;
  }
  // /**
  //  * @returns undefined if the item is not a specie or a path, null if there is no capacities already, all the capacities
  //  * @type {boolean}
  //  */
  // get allCapacities() {
  //   if (!this.type == ITEM_TYPE.SPECIE && !this.type == ITEM_TYPE.PATH) return undefined;
  //   // No capacities
  //   if (this.system.capacities === undefined) return null;
  //   return this.system.capacities;
  // }

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

  /**
   * @description Calculate the sum of all bonus for a specific type and target
   * @param {*} type      MODIFIER_TYPE
   * @param {*} subtype   MODIFIER_SUBTYPE
   * @param {*} target    MODIFIER_TARGET
   * @returns the value of the bonus
   */
  getTotalModifiersByTypeSubtypeAndTarget(type, subtype, target) {
    if (![ITEM_TYPE.EQUIPMENT, ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;
    if (!this.hasModifiers) return 0;
    return this.modifiers
      .filter((m) => m.type == type && m.subtype == subtype && m.target == target)
      .map((i) => i.modifier)
      .reduce((acc, curr) => acc + curr, 0);
  }

  /**
   * @description Calculate the sum of all bonus for a specific type and target
   * @param {*} type trait
   * @param {*} target For trait type, target are str, dex, etc...
   * @returns the value of the bonus
   */
  getModifiersByTypeAndSubtype(type, subtype) {
    if (![ITEM_TYPE.EQUIPMENT, ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;
    if (!this.hasModifiers) return 0;
    return this.modifiers.filter((m) => m.type == type && m.subtype == subtype);
  }

  /**
   * @returns an array of all the actions of the item or empty if no actions or if it's an item without actions
   */
  get actions() {
    if (foundry.utils.isEmpty(this.system.actions)) return [];
    if (this.system.actions instanceof Array) return this.system.actions;
    return Object.values(this.system.actions);
  }

  // TO FIX Est-ce utile ?
  updateActionsSource(source){
    this.system.actions.forEach(action => {
        action.source = source;      
    });
  }

  /**
   * Add a capacity to an item of type Path or Feature
   * @param {*} uuid 
   */
  addCapacity(uuid) {
    if (this.type == ITEM_TYPE.PATH || this.type == ITEM_TYPE.FEATURE) {
      let newCapacities = foundry.utils.duplicate(this.system.capacities);
      newCapacities.push(uuid);
      this.update({"system.capacities": newCapacities});
    }
  }

  /**
   * @returns Basic info for a capacity : uuid, name, img, description
   */
  get infosCapacity() {
    if (this.type == ITEM_TYPE.CAPACITY) {
      return {
        "uuid": this.uuid,
        "name": this.name,
        "img": this.img,
        "description": this.system.description.value
      }
    }
  }

}
