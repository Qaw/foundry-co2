import { ITEM_TYPE } from "../system/constants.mjs";
/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class CoItem extends Item {
  constructor(...args) {
    super(...args);
  }

  /** @override */
  prepareDerivedData() {
    this.system.slug = this.name.slugify({ strict: true });
  }

  //#region accesseurs
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
        if (this.system.modifiers.length > 0) return true;
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

  get tags() {
    return this.system.tags;
  }

  /**
   * @returns An array of all the actions of the item or empty if no actions or if it's an item without actions
   */
  get actions() {
    if (foundry.utils.isEmpty(this.system.actions)) return [];
    if (this.system.actions instanceof Array) return this.system.actions;
    return Object.values(this.system.actions);
  }

  /**
   * @returns An array of all the visible actions of the item or empty if no actions or if it's an item without actions
   */
  get visibleActions() {
    if (foundry.utils.isEmpty(this.system.actions)) return [];
    if (this.system.actions instanceof Array) return this.system.actions.filter((action) => action.properties.visible);
    return Object.values(this.system.actions).filter((action) => action.properties.visible);
  }

  /**
   * @returns Basic info for a capacity : uuid, name, img, description
   */
  get infosCapacity() {
    if (this.type == ITEM_TYPE.CAPACITY) {
      return {
        uuid: this.uuid,
        name: this.name,
        img: this.img,
        description: this.system.description.value,
      };
    }
  }

  //#endregion

  //#region méthodes publiques

  /**
   * 
   * @returns the items of type Capacity based on the ids for a path in an actor
   */
  async getEmbeddedCapacities(actor) {
    if ([ITEM_TYPE.PATH].includes(this.type)){
      let capacities = [];
      for (const capacityId of this.system.capacities) {
        const capacity = actor.items.get(capacityId);
        capacities.push(capacity);        
      }
      return capacities;
    }
  }

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
   * Add a capacity to an item of type Path or Feature
   * @param {*} uuid
   */
  addCapacity(uuid) {
    if (this.type == ITEM_TYPE.PATH || this.type == ITEM_TYPE.FEATURE) {
      let newCapacities = foundry.utils.duplicate(this.system.capacities);
      newCapacities.push(uuid);
      this.update({ "system.capacities": newCapacities });
    }
  }

  /**
   * Update the rank for an embedded path item
   * @returns 
   */
  updateRank() {
    if (this.type !== ITEM_TYPE.PATH || !this.actor) return;
    let max = 0;
    this.system.capacities.forEach(c => {
      const capacity = this.actor.items.get(c);
      if (capacity && capacity.system.learned) {
        const rank = this.system.capacities.indexOf(c) + 1;
        if(rank > max) max = rank;
      }
    });
    this.update({ "system.rank": max });
  }

  /**
   * Update the actions for an embedded capacity item
   * @returns 
   */
  toggleActions() {
    if ((this.type !== ITEM_TYPE.CAPACITY && this.type !== ITEM_TYPE.EQUIPMENT) || !this.actor) return;
    let actions = this.actions;
    for (const action of actions) {
      action.properties.visible = !action.properties.visible;
      // Si c'est une action non activable, l'activer automatiquement
      if (!action.properties.activable) {
        action.properties.enabled = !action.properties.enabled;
      }
    }
    this.update ({ "system.actions": actions});
  }
  //#endregion
}
