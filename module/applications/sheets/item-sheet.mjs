import CoBaseItemSheet from "./base-item-sheet.mjs"

import { Action } from "../../models/action/action.mjs"
import { Condition } from "../../models/action/condition.mjs"
import { Modifier } from "../../models/action/modifiers.mjs"
import { Resolver } from "../../models/action/resolvers.mjs"

import { SYSTEM } from "../../config/system.mjs"
export default class CoItemSheet extends CoBaseItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 720,
      classes: ["co", "sheet", "item"],
      tabs: [
        { navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details" },
        { navSelector: ".action-tabs", contentSelector: ".action-body", initial: "0" },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    })
  }

  /** @override */
  get template() {
    return "systems/co/templates/items/item-sheet.hbs"
  }

  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)
    console.log("Item-Sheet context", context)
    if (this.item.type === SYSTEM.ITEM_TYPE.EQUIPMENT || this.item.type === SYSTEM.ITEM_TYPE.PROFILE) {
      context.martialTrainingsWeaponsList = context.config.martialTrainingsWeapons
      context.martialTrainingsArmorsList = context.config.martialTrainingsArmors
      context.martialTrainingsShieldsList = context.config.martialTrainingsShields
    }

    if (this.item.type === SYSTEM.ITEM_TYPE.PATH || this.item.type === SYSTEM.ITEM_TYPE.FEATURE) {
      let infosCapacities = []
      for (const capacity of this.item.system.capacities) {
        let item = null
        // Embedded item on actor
        if (this.item.isEmbedded) {
          const actor = this.item.parent
          item = actor.items.get(capacity)
        }
        // World or compendium item
        else {
          item = await fromUuid(capacity)
        }
        // Item could be null if the item has been deleted in the compendium
        if (item != null) {
          infosCapacities.push(item.infos)
        }
      }
      context.capacities = infosCapacities
    }

    if (this.item.type === SYSTEM.ITEM_TYPE.FEATURE || this.item.type === SYSTEM.ITEM_TYPE.PROFILE) {
      let infosPaths = []
      for (const path of this.item.system.paths) {
        let item = null
        // Embedded item on actor
        if (this.item.isEmbedded) {
          const actor = this.item.parent
          item = actor.items.get(path)
        }
        // World or compendium item
        else {
          item = await fromUuid(path)
        }
        // Item is null if the item has been deleted in the compendium
        if (item != null) {
          infosPaths.push(item.infos)
        }
      }
      context.paths = infosPaths
    }

    // Contexte spécifique Feature
    if (this.item.type === SYSTEM.ITEM_TYPE.FEATURE) {
      context.choiceFeatureSubtypes = SYSTEM.FEATURE_SUBTYPE
      context.choiceModifierSubtypes = SYSTEM.MODIFIERS.MODIFIERS_SUBTYPE
      context.choiceModifierTargets = SYSTEM.MODIFIERS.MODIFIERS_TARGET
    }

    // Contexte spécifique Voie
    if (this.item.type === SYSTEM.ITEM_TYPE.PATH) {
      context.choicePathSubtypes = SYSTEM.PATH_SUBTYPE
    }

    // Contexte spécifique Capacité
    if (this.item.type === SYSTEM.ITEM_TYPE.CAPACITY) {
      context.choiceModifierSubtypes = SYSTEM.MODIFIERS.MODIFIERS_SUBTYPE
      context.choiceModifierTargets = SYSTEM.MODIFIERS.MODIFIERS_TARGET
    }
    return context
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event)
    const item = this.item

    /**
     * A hook event that fires when some useful data is dropped onto an ItemSheet.
     * @function dropActorSheetData
     * @memberof hookEvents
     * @param {Item} item      The Item
     * @param {ItemSheet} sheet The ItemSheet application
     * @param {object} data      The data that has been dropped onto the sheet
     */
    const allowed = Hooks.call("dropItemSheetData", item, this, data)
    if (allowed === false) return

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect":
        return // This._onDropActiveEffect(event, data);
      case "Actor":
        return // This._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data)
      case "Folder":
      // This._onDropFolder(event, data);
    }
  }

  /**
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    event.preventDefault()
    if (!this.item.isOwner) return false
    const item = await Item.implementation.fromDropData(data)
    // Const itemData = item.toObject();

    // Handle item sorting within the same Actor
    // if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    switch (item.type) {
      case SYSTEM.ITEM_TYPE.EQUIPMENT:
        return this._onDropEquipmentItem(item)
      case SYSTEM.ITEM_TYPE.FEATURE:
        return this._onDropFeatureItem(item)
      case SYSTEM.ITEM_TYPE.PROFILE:
        return this._onDropProfileItem(item)
      case SYSTEM.ITEM_TYPE.PATH:
        return this._onDropPathItem(item)
      case SYSTEM.ITEM_TYPE.CAPACITY:
        return this._onDropCapacityItem(item)
      default:
        return false
    }
  }

  _onDropEquipmentItem(item) {
    let itemData = item.object
    /* ItemData = itemData instanceof Array ? itemData : [itemData];
            return this.item.createEmbeddedDocuments("Item", itemData); */
    return false
  }

  _onDropFeatureItem(item) {
    let itemData = item.object
    /* ItemData = itemData instanceof Array ? itemData : [itemData];
            return this.item.createEmbeddedDocuments("Item", itemData); */
    return false
  }

  _onDropProfileItem(item) {
    let itemData = item.object
    /* ItemData = itemData instanceof Array ? itemData : [itemData];
            return this.item.createEmbeddedDocuments("Item", itemData); */
    return false
  }

  _onDropPathItem(item) {
    if (item.uuid) return this.item.addPath(item.uuid)
    return false
  }

  _onDropCapacityItem(item) {
    if (item.uuid) return this.item.addCapacity(item.uuid)
    return false
  }

  /**
   *
   * @param {*} itemData
   * @param {string} uuid
   * @returns
   */
  // _onDropCapacityItem(item) {
  //     console.log("_onDropCapacityItem : ", item);
  //     const itemData = item.toObject();
  //
  //     if (this.item.type == "path") {
  //         if (this.item.hasCapacityBySource(itemData.flags.core.sourceId)) return;
  //         let system = foundry.utils.duplicate(this.item.system);
  //         system.capacities.push({
  //             source: item.uuid,
  //             key: item.system.key,
  //             name: itemData.name,
  //             img: itemData.img,
  //             description: itemData.system.description,
  //             selected: false
  //         });
  //         const rank = system.maxRank === null ? 1 : system.maxRank + 1;
  //         system.maxRank = rank;
  //
  //         this.item.update({system: system});
  //     }
  // }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * @param {object[]|object} itemData     The item data requested for creation
   * @returns {Promise<Item[]>}
   * @private
   */
  // async _onDropItemCreate(itemData) {
  //     itemData = itemData instanceof Array ? itemData : [itemData];
  //
  //     //return this.actor.createEmbeddedDocuments("Item", itemData);
  // }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html)
    html.find(".section-toggle").click(this._onSectionToggle.bind(this))
    html.find(".item-delete").click(this._onDeleteItem.bind(this))
    html.find(".item-edit").click(this._onEditItem.bind(this))
    html.find(".action-modifier-add").click(this._onAddActionModifier.bind(this))
    html.find(".action-modifier-delete").click(this._onDeleteActionModifier.bind(this))
    html.find(".modifier-add").click(this._onAddModifier.bind(this))
    html.find(".modifier-delete").click(this._onDeleteModifier.bind(this))
    html.find(".resolver-add").click(this._onAddResolver.bind(this))
    html.find(".resolver-delete").click(this._onDeleteResolver.bind(this))
    html.find(".condition-add").click(this._onAddCondition.bind(this))
    html.find(".condition-delete").click(this._onDeleteCondition.bind(this))
    html.find(".action-add").click(this._onAddAction.bind(this))
    html.find(".action-delete").click(this._onDeleteAction.bind(this))
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onSectionToggle(event) {
    event.preventDefault()
    const li = $(event.currentTarget).parent().next(".foldable")
    li.slideToggle("fast")
    return true
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onDeleteItem(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".item")
    const itemType = li.data("itemType")
    // Const itemId = li.data("itemId");
    const uuid = li.data("uuid")
    let data = duplicate(this.item)
    // Console.log(itemType, uuid, data);
    switch (itemType) {
      case SYSTEM.ITEM_TYPE.PATH:
        data.system.paths.splice(data.system.paths.indexOf(uuid), 1)
        break
      case SYSTEM.ITEM_TYPE.CAPACITY:
        data.system.capacities.splice(data.system.capacities.indexOf(uuid), 1)
        break
      default:
        break
    }

    return this.item.update(data)
  }

  /**
   * @param event
   * @private
   */
  _onEditItem(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".item")
    const itemType = li.data("itemType")

    switch (itemType) {
      case SYSTEM.ITEM_TYPE.PATH:
      case SYSTEM.ITEM_TYPE.CAPACITY: {
        const uuid = li.data("uuid")
        return fromUuid(uuid).then((document) => document.sheet.render(true))
      }
      default:
        break
    }
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onAddAction(event) {
    event.preventDefault()
    let newActions = foundry.utils.deepClone(this.item.actions)
    let action = new Action(this.item.uuid, newActions.length, "melee", "icons/svg/d20-highlight.svg", `${game.i18n.localize("CO.ui.newAction")} ${this.item.actions.length + 1}`)
    // Attack action must be Visible and Activable by default
    if (this.item.type === "attack") {
      action.properties.visible = true
      action.properties.activable = true
    }
    newActions.push(action)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onDeleteAction(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".action")
    const rowId = li.data("itemId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    newActions.splice(rowId, 1)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onAddCondition(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".action")
    const rowId = li.data("itemId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    console.log(newActions[rowId])
    let condition = new Condition("item", "isEquipped", "_self")

    if (!newActions[rowId].conditions) newActions[rowId].conditions = []
    newActions[rowId].conditions.push(condition)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onDeleteCondition(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".condition")
    const condId = li.data("itemId")
    const actionId = li.data("actionId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    newActions[actionId].conditions.splice(condId, 1)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onAddActionModifier(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".action")
    const rowId = li.data("itemId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    if (!newActions[rowId].modifiers) newActions[rowId].modifiers = []
    newActions[rowId].modifiers.push(new Modifier(this.item.uuid, this.item.type))
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onDeleteActionModifier(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".modifier")
    const condId = li.data("itemId")
    const actionId = li.data("actionId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    newActions[actionId].modifiers.splice(condId, 1)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   * Adds a new Modifier to the item and updates the item with the new modifier list.
   * Only for the item of type Feature or Profile
   * @param {Event} event The event object triggered by the user action.
   * @returns {Promise} A promise that resolves when the item is successfully updated.
   */
  _onAddModifier(event) {
    event.preventDefault()

    const currentModifiers = this.item.modifiers || []
    const newModifiers = foundry.utils.deepClone(currentModifiers)

    newModifiers.push(new Modifier(this.item.uuid, this.item.type))

    return this.item.update({ "system.modifiers": newModifiers })
  }

  /**
   * Delete a Modifier from the item
   * Only for the item of type Feature or Profile
   * @param {Event} event The event object triggered by the user action.
   * @returns {Promise} A promise that resolves when the item is successfully updated.
   */
  _onDeleteModifier(event) {
    event.preventDefault()

    const li = $(event.currentTarget).closest(".modifier")
    const rowId = li.data("itemId")

    const currentModifiers = this.item.modifiers || []
    const newModifiers = foundry.utils.deepClone(currentModifiers)

    newModifiers.splice(rowId, 1)

    return this.item.update({ "system.modifiers": newModifiers })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onAddResolver(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".action")
    const rowId = li.data("itemId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    let resolver = new Resolver(
      "melee",
      {
        formula: [{ part: "@atc" }],
        crit: "20",
        difficulty: "@def",
      },
      {
        formula: [{ part: "" }],
      },
    )
    if (!newActions[rowId].resolvers) newActions[rowId].resolvers = []
    newActions[rowId].resolvers.push(resolver)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onDeleteResolver(event) {
    event.preventDefault()
    const li = $(event.currentTarget).closest(".resolver")
    const condId = li.data("itemId")
    const actionId = li.data("actionId")
    let newActions = foundry.utils.deepClone(this.item.actions)
    newActions[actionId].resolvers.splice(condId, 1)
    return this.item.update({ "system.actions": newActions })
  }

  /**
   * For item of type Capacity or Equipment, add array for modifiers, conditions and resolvers when they are empty on the sheet
   * @param {*} event
   * @param {*} formData
   */
  _updateObject(event, formData) {
    if (this.item.type === SYSTEM.ITEM_TYPE.CAPACITY || this.item.type === SYSTEM.ITEM_TYPE.EQUIPMENT) {
      formData = foundry.utils.expandObject(formData)

      // Parcours des actions pour ajouter les tableaux vides
      if (!foundry.utils.isEmpty(formData.system.actions)) {
        Object.values(formData.system.actions).forEach((action) => {
          if (foundry.utils.isEmpty(action.modifiers)) action.modifiers = []
          else action.modifiers = Object.values(action.modifiers)
          if (foundry.utils.isEmpty(action.conditions)) action.conditions = []
          else action.conditions = Object.values(action.conditions)
          if (foundry.utils.isEmpty(action.resolvers)) action.resolvers = []
          else action.resolvers = Object.values(action.resolvers)
        })
      }
    }
    super._updateObject(event, formData)
  }
}
