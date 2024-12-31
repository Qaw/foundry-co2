import { Action } from "../models/action/action.mjs"
import { Condition } from "../models/action/condition.mjs"
import { SYSTEM } from "../config/system.mjs"
/**
 * Extend the base Item entity
 * @extends {Item}
 */
export default class CoItem extends Item {
  constructor(...args) {
    let data = args[0]
    if (!data.img && SYSTEM.ITEM_ICONS[data.type]) data.img = SYSTEM.ITEM_ICONS[data.type]
    super(...args)
  }

  // #region accesseurs
  /**
   * Does it have modifiers ?
   * @returns {boolean} undefined if the item is a path, true if the item has modifiers
   * @type {boolean}
   */
  get hasModifiers() {
    if (![SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.FEATURE, SYSTEM.ITEM_TYPE.PROFILE, SYSTEM.ITEM_TYPE.CAPACITY].includes(this.type)) return undefined
    return this.modifiers.length > 0
  }

  /**
   * Return an array of Modifiers
   */
  get modifiers() {
    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.CAPACITY].includes(this.type)) {
      return this.getModifiersFromActions(false)
    }
    // For Feature or Profile, the modifiers are in the item
    if ([SYSTEM.ITEM_TYPE.FEATURE, SYSTEM.ITEM_TYPE.PROFILE].includes(this.type)) {
      return this.system.modifiers instanceof Array ? this.system.modifiers : Object.values(this.system.modifiers)
    } else return []
  }

  /**
   * Returns an array of modifiers from the actions, with an optional filter for enabled actions.
   *
   * @param {boolean} [filterEnabled=false] If true, only enabled actions will be considered.
   * @returns {Array} An array of modifiers from the actions.
   */
  getModifiersFromActions(filterEnabled = false) {
    const filteredActions = filterEnabled ? this.actions.filter((action) => action.properties.enabled) : this.actions

    // Use `flatMap` to create a new array containing the modifiers from each action.
    // This will also flatten the resulting array of modifiers in a single step.
    return filteredActions.flatMap((action) => {
      // Destructure the `modifiers` property from the action object
      const { modifiers } = action
      if (!modifiers) return []
      return Array.isArray(modifiers) ? modifiers : Object.values(modifiers)
    })
  }

  /**
   * Return an array of enabled Modifiers
   * If the item has actions, only enabled actions are taken into account
   */
  get enabledModifiers() {
    // For Equipement or Capacity Item, the modifiers are in the actions
    if ([SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.CAPACITY].includes(this.type)) return this.getModifiersFromActions(true)
    else return this.modifiers
  }

  get tags() {
    return this.system.tags
  }

  /**
   * An array of all the actions of the item or empty if no actions or if it's an item without actions
   */
  get actions() {
    if (foundry.utils.isEmpty(this.system.actions)) return []
    if (this.system.actions instanceof Array) return this.system.actions
    return Object.values(this.system.actions)
  }

  /**
   * An array of all the visible actions of the item or empty if no actions or if it's an item without actions
   */
  get visibleActions() {
    if (foundry.utils.isEmpty(this.system.actions)) return []

    return this.actions.map((i) => Action.createFromExisting(i)).filter((action) => action.isVisible(this))
  }

  /**
   * Basic info for a capacity : uuid, name, img, description
   */
  get infos() {
    if (this.type === SYSTEM.ITEM_TYPE.CAPACITY || this.type === SYSTEM.ITEM_TYPE.PATH) {
      return {
        uuid: this.uuid,
        name: this.name,
        img: this.img,
        description: this.system.description,
      }
    }
    return null
  }

  /**
   * Informations of the item to be displayed in the chat via sendToChat button
   * @param {*} chatType
   * item : Item and all actions
   * loot : Item without actions
   * action : Item and a specific action
   * @param {string} indice of the action, null for others
   */
  getChatData(chatType, indice = null) {
    if (this.type === SYSTEM.ITEM_TYPE.CAPACITY || this.type === SYSTEM.ITEM_TYPE.EQUIPMENT || this.type === SYSTEM.ITEM_TYPE.ATTACK) {
      let actions = []
      // All actions
      if (chatType === "item" && indice === null) {
        for (const action of this.actions) {
          let act = Action.createFromExisting(action)
          actions.push(...act.chatData)
        }
      } else if (chatType === "action") {
        const action = this.actions.find((a) => a.indice === parseInt(indice))
        console.log("getChatData action", action)
        let act = Action.createFromExisting(action)
        actions.push(...act.chatData)
      }
      return {
        id: this.id,
        name: this.name,
        img: this.img,
        description: this.system.description,
        actions: actions,
      }
    }
  }

  // #endregion

  // #region méthodes publiques

  /**
   * The items of type Capacity based on the ids for a path in an actor
   * @param {Actor} actor
   */
  async getEmbeddedCapacities(actor) {
    if ([SYSTEM.ITEM_TYPE.PATH].includes(this.type)) {
      let capacities = []
      for (const capacityId of this.system.capacities) {
        const capacity = actor.items.get(capacityId)
        capacities.push(capacity)
      }
      return capacities
    }
  }

  /**
   * Calculate the sum of all bonus for a specific type and target
   * @param {*} type      MODIFIERS_TYPE
   * @param {*} subtype   MODIFIERS_SUBTYPE
   * @param {*} target    MODIFIERS_TARGET
   * @returns the value of the bonus
   */
  getTotalModifiersByTypeSubtypeAndTarget(type, subtype, target) {
    if (![SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.FEATURE, SYSTEM.ITEM_TYPE.PROFILE, SYSTEM.ITEM_TYPE.CAPACITY].includes(this.type)) return undefined
    if (!this.hasModifiers) return 0
    return this.modifiers
      .filter((m) => m.type === type && m.subtype === subtype && m.target === target)
      .map((i) => i.modifier)
      .reduce((acc, curr) => acc + curr, 0)
  }

  /**
   * Calculate the sum of all bonus for a specific type and target
   * @param {*} type trait
   * @param subtype
   * @param {*} target For trait type, target are str, dex, etc...
   * @returns the value of the bonus
   */
  getModifiersByTypeAndSubtype(type, subtype) {
    if (![SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.FEATURE, SYSTEM.ITEM_TYPE.PROFILE, SYSTEM.ITEM_TYPE.CAPACITY].includes(this.type)) return undefined
    if (!this.hasModifiers) return 0
    return this.modifiers.filter((m) => m.type === type && m.subtype === subtype)
  }

  /**
   * Add a capacity to an item of type Path or Feature
   * @param {*} uuid
   */
  addCapacity(uuid) {
    if (this.type === SYSTEM.ITEM_TYPE.PATH || this.type === SYSTEM.ITEM_TYPE.FEATURE) {
      let newCapacities = foundry.utils.duplicate(this.system.capacities)
      newCapacities.push(uuid)
      return this.update({ "system.capacities": newCapacities })
    }
    return false
  }

  /**
   * Add a path to an item of type Path or Feature
   * @param {*} uuid
   */
  addPath(uuid) {
    if (this.type === SYSTEM.ITEM_TYPE.FEATURE || this.type === SYSTEM.ITEM_TYPE.PROFILE) {
      let newPaths = foundry.utils.duplicate(this.system.paths)
      newPaths.push(uuid)
      return this.update({ "system.paths": newPaths })
    }
    return false
  }

  /**
   * Update the rank for an embedded path item
   */
  async updateRank() {
    if (this.type !== SYSTEM.ITEM_TYPE.PATH || !this.actor) return
    let max = 0

    for (const uuid of this.system.capacities) {
      const capacity = await fromUuid(uuid)
      if (capacity && capacity.system.learned) {
        const rank = this.system.capacities.indexOf(uuid) + 1
        if (rank > max) max = rank
      }
    }
    this.update({ "system.rank": max })
  }

  /**
   * Update the actions for an embedded capacity item
   */
  toggleActions() {
    if ((this.type !== SYSTEM.ITEM_TYPE.CAPACITY && this.type !== SYSTEM.ITEM_TYPE.EQUIPMENT) || !this.actor) return
    let actions = this.actions
    for (const action of actions) {
      let act = new Action(action)
      // Let act = new Action(action.source, action.indice, action.type, action.img, action.label, action.chatFlavor, action.properties.visible, action.properties.activable, action.properties.enabled, action.properties.temporary, action.conditions, action.modifiers, action.resolvers);
      // action.properties.visible = !action.properties.visible;
      // Si c'est une action non activable, l'activer automatiquement
      if (!action.properties.activable) {
        action.properties.enabled = !action.properties.enabled
      } else {
        // Vérifier si les conditions sont remplies
        if (!act.hasConditions) {
          action.properties.visible = !action.properties.visible
        } else {
          action.properties.visible = act.isVisible(this)
        }
      }
    }
    this.update({ "system.actions": actions })
  }
  // #endregion
}
