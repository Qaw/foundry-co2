import { ITEM_TYPE } from "../system/constants.mjs";
import { Action } from "../models/action/action.mjs";
import { Condition } from "../models/action/condition.mjs";
/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class CoItem extends Item {
  constructor(...args) {
    let data = args[0];
    if (!data.img && game.co.config.itemIcons[data.type]) data.img = game.co.config.itemIcons[data.type];
    super(...args);
  }


  /** @override */
  prepareDerivedData() {
    this.system.common.slug = this.name.slugify({ strict: true });
  }

  //#region accesseurs
  /**
   * @returns undefined if the item is a path, true if the item has modifiers
   * @type {boolean}
   */
  get hasModifiers() {
    if (![ITEM_TYPE.EQUIPMENT, ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE, ITEM_TYPE.CAPACITY].includes(this.type)) return undefined;
    return this.modifiers.length > 0;
  }

  /**
   * Return an array of Modifiers
   */
  get modifiers() {
    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(this.type)) {
      return this.getModifiersFromActions(false);
    }
    // For Feature or Profile, the modifiers are in the item
    if ([ITEM_TYPE.FEATURE, ITEM_TYPE.PROFILE].includes(this.type)) {
      return (this.system.modifiers instanceof Array) ? this.system.modifiers : Object.values(this.system.modifiers);
    }
    else return []
  }

  /**
 * Returns an array of modifiers from the actions, with an optional filter for enabled actions.
 *
 * @param {boolean} [filterEnabled=false] - If true, only enabled actions will be considered.
 * @returns {Array} An array of modifiers from the actions.
 */
  getModifiersFromActions(filterEnabled = false) {
    const filteredActions = filterEnabled ? this.actions.filter(action => action.properties.enabled) : this.actions;
  
    // Use `flatMap` to create a new array containing the modifiers from each action.
    // This will also flatten the resulting array of modifiers in a single step.
    return filteredActions.flatMap(action => {
      // Destructure the `modifiers` property from the action object
      const { modifiers } = action;
      if (!modifiers) return [];
      return Array.isArray(modifiers) ? modifiers : Object.values(modifiers);
    });
  }
  

  /**
   * Return an array of enabled Modifiers
   * If the item has actions, only enabled actions are taken into account
   */
  get enabledModifiers() {
    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(this.type)) return this.getModifiersFromActions(true);
    else return this.modifiers;
  }

  get tags() {
    return this.system.common.tags;
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

    return this.actions.map(i=>Action.createFromExisting(i)).filter(action => action.isVisible(this));
  }

  /**
   * @returns Basic info for a capacity : uuid, name, img, description
   */
  get infos() {
    if (this.type === ITEM_TYPE.CAPACITY || this.type === ITEM_TYPE.PATH) {
      return {
        uuid: this.uuid,
        name: this.name,
        img: this.img,
        description: this.system.common.description,
      };
    }
  }

  /**
   * @returns Informations of all the items to be displayed in the chat via sendToChat button
   */
  get chatData() {
    if (this.type === ITEM_TYPE.CAPACITY || this.type === ITEM_TYPE.EQUIPMENT) {
      let actions = [];
      for (const action of this.actions) {
        let act = Action.createFromExisting(action);
        actions.push(...act.chatData);
      }
      return {
        id: this.id,
        name: this.name,
        img: this.img,
        description: this.system.common.description,
        actions: actions
      }
    }
  }

  /**
   * @returns Informations of a single action to be displayed in the chat via sendToChat button
   * @param {*} indice 
   */
  getchatDataFromAction(indice) {    
    if (this.type === ITEM_TYPE.CAPACITY || this.type === ITEM_TYPE.EQUIPMENT) {
      const action =  Action.createFromExisting(this.actions[indice]);
      return {
        id: this.id,
        name: this.name,
        img: this.img,
        description: this.system.common.description,
        actions: action.chatData
      }
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
      .filter((m) => m.type === type && m.subtype === subtype && m.target === target)
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
    return this.modifiers.filter((m) => m.type === type && m.subtype === subtype);
  }

  /**
   * Add a capacity to an item of type Path or Feature
   * @param {*} uuid
   */
  addCapacity(uuid) {
    if (this.type === ITEM_TYPE.PATH || this.type === ITEM_TYPE.FEATURE) {
      let newCapacities = foundry.utils.duplicate(this.system.capacities);
      newCapacities.push(uuid);
      return this.update({ "system.capacities": newCapacities });
    }
    return false
  }

  /**
   * Add a path to an item of type Path or Feature
   * @param {*} uuid
   */
  addPath(uuid) {
    if (this.type === ITEM_TYPE.FEATURE || this.type === ITEM_TYPE.PROFILE) {
      let newPaths = foundry.utils.duplicate(this.system.paths);
      newPaths.push(uuid);
      return this.update({ "system.paths": newPaths });
    }
    return false
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
      let act = new Action(action);
      // let act = new Action(action.source, action.indice, action.type, action.img, action.label, action.chatFlavor, action.properties.visible, action.properties.activable, action.properties.enabled, action.properties.temporary, action.conditions, action.modifiers, action.resolvers);
      // action.properties.visible = !action.properties.visible;      
      // Si c'est une action non activable, l'activer automatiquement
      if (!action.properties.activable) {
        action.properties.enabled = !action.properties.enabled;
      }
      else {
        // Vérifier si les conditions sont remplies
        if (!act.hasConditions) {
          action.properties.visible = !action.properties.visible;  
        }
        else {
          action.properties.visible = act.isVisible(this);
        }
      }
    }
    this.update ({ "system.actions": actions});
  }
  //#endregion
}
