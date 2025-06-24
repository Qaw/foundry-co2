import CoBaseActorSheetV2 from "./base-actor-sheet-v2.mjs"
import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"
import { CoEditAbilitiesDialog } from "../../dialogs/edit-abilities-dialog.mjs"

export default class COCharacterSheetV2 extends CoBaseActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    position: {
      width: 800,
      height: 900,
    },
    window: {
      contentClasses: ["character-content"],
      resizable: true,
    },
    actions: {
      activate: COCharacterSheetV2.#onActivateDef,
      deactivate: COCharacterSheetV2.#onDeactivateDef,
      editAbilities: COCharacterSheetV2.#onEditAbilities,
      deleteItem: COCharacterSheetV2.#onDeleteItem,
      deletePath: COCharacterSheetV2.#onDeletePath,
      roll: COCharacterSheetV2.#onRoll,
      toggleAction: COCharacterSheetV2.#onUseAction,
      toggleEffect: COCharacterSheetV2.#onUseEffect,
      attack: COCharacterSheetV2.#onUseAction,
      damage: COCharacterSheetV2.#onUseAction,
      inventoryEquip: COCharacterSheetV2.#onEquippedToggle,
      useRecovery: COCharacterSheetV2.#onUseRecovery,
      activeRest: COCharacterSheetV2.#onUseRecovery,
    },
  }

  /** @override */
  static PARTS = {
    header: { template: "systems/co/templates/v2/actors/character-header.hbs" },
    sidebar: { template: "systems/co/templates/v2/actors/character-sidebar.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: "systems/co/templates/v2/actors/character-main.hbs" },
    inventory: { template: "systems/co/templates/v2/actors/character-inventory.hbs" },
    paths: { template: "systems/co/templates/v2/actors/shared/paths.hbs", templates: ["systems/co/templates/v2/actors/shared/capacities-nopath.hbs"], scrollable: [""] },
    effects: { template: "systems/co/templates/v2/actors/shared/effects.hbs" },
    biography: { template: "systems/co/templates/v2/actors/character-biography.hbs" },
  }

  /** @override */
  static TABS = {
    primary: {
      tabs: [{ id: "main" }, { id: "inventory" }, { id: "paths" }, { id: "effects" }, { id: "biography" }],
      initial: "main",
      labelPrefix: "CO.sheet.tabs.character",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    context.profiles = this.document.profiles

    context.xpMax = this.document.system.attributes.xp.max
    context.xpSpent = await this.document.system.getSpentXP()
    context.xpLeft = await this.document.system.getAvailableXP()

    context.overloadMalus = this.document.malusFromArmor

    // Select options
    context.choiceAbilities = SYSTEM.ABILITIES
    context.choiceSize = SYSTEM.SIZES

    // Gestion des défenses
    context.partialDef = this.document.hasEffect("partialDef")
    context.fullDef = this.document.hasEffect("fullDef")

    if (CONFIG.debug.co?.sheets) console.debug(Utils.log(`COCharacterSheetV2 - context`), context)

    return context
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)
    // Additional character-specific render logic can go here
  }

  /**
   * Action d'utiliser : active ou désactive une action
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onUseAction(event, target) {
    event.preventDefault()
    const shiftKey = !!event.shiftKey
    const dataset = target.dataset
    const action = dataset.actionType
    const type = dataset.type
    const source = dataset.source
    const indice = dataset.indice

    let activation
    if (action === "activate") {
      activation = await this.document.activateAction({ state: true, source, indice, type, shiftKey })
    } else if (action === "unactivate") {
      activation = await this.document.activateAction({ state: false, source, indice, type })
    }
  }

  /**
   * Handles the use effect event.
   *
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   * @returns {Promise<void>} A promise that resolves when the effect activation is complete.
   */
  static async #onUseEffect(event, target) {
    event.preventDefault()
    const dataset = target.dataset
    const effectid = dataset.effect
    const action = dataset.actionType
    let activation
    if (action === "activate") {
      activation = await this.document.activateCOStatusEffect({ state: true, effectid })
    } else if (action === "unactivate") {
      activation = await this.document.activateCOStatusEffect({ state: false, effectid })
    }
  }

  /**
   * Gère l'utilisation des points de récupération ou du repos complet pour l'acteur.
   *
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static #onUseRecovery(event, target) {
    event.preventDefault()
    const dataset = target.dataset
    let isFullRest = false
    if (dataset.option && dataset.option === "fullRest") isFullRest = true
    return this.document.system.useRecovery(isFullRest)
  }

  /**
   * Equip or unequip the equipment
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onEquippedToggle(event, target) {
    event.preventDefault()
    const itemId = $(target).parents(".item").data("itemId")
    const bypassChecks = event.shiftKey
    await this.document.toggleEquipmentEquipped(itemId, bypassChecks)
  }

  /**
   * Delete the selected item
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onDeleteItem(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const itemId = li.dataset.itemId
    const itemUuid = li.dataset.itemUuid
    const itemType = li.dataset.itemType
    switch (itemType) {
      case "path":
        await COCharacterSheetV2.#onDeletePath(event, target)
        break
      case "capacity":
        await COCharacterSheetV2.#onDeleteCapacity(event, target, itemUuid)
        break
      case "feature":
        await COCharacterSheetV2.#onDeleteFeature(event, target, itemUuid)
        break
      case "profile":
        await COCharacterSheetV2.#onDeleteProfile(event, target)
        break
      default:
        this.document.deleteEmbeddedDocuments("Item", [itemId])
    }
  }

  /**
   * Deletes a feature from the actor.
   *
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   * @param {string} itemUuid The UUID of the item to be deleted.
   * @returns {Promise<void>} A promise that resolves when the feature is deleted.
   */
  static async #onDeleteFeature(event, target, itemUuid) {
    await this.document.deleteFeature(itemUuid)
  }

  /**
   * Delete the selected profile
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onDeleteProfile(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const profileId = li.dataset.itemId
    this.document.deleteProfile(profileId)
  }

  /**
   * Delete the selected path
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onDeletePath(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const uuid = li.dataset.itemUuid
    this.document.deletePath(uuid)
  }

  /**
   * Handles the deletion of a capacity item from the actor.
   *
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   * @param {string} itemUuid The unique identifier of the item to be deleted.
   * @returns {Promise<void>} A promise that resolves when the capacity item has been deleted.
   */
  static async #onDeleteCapacity(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const uuid = li.dataset.itemUuid
    await this.document.deleteCapacity(uuid)
  }

  /**
   * Edit Abilities event handler
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onEditAbilities(event, target) {
    event.preventDefault()
    return new CoEditAbilitiesDialog({ actor: this.document }).render(true)
  }

  /**
   * Handle roll events
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static #onRoll(event, target) {
    const dataset = target.dataset
    const type = dataset.rollType
    const rollTarget = dataset.rollTarget

    switch (type) {
      case "skillcheck":
        this.document.rollSkill(rollTarget)
        break
      case "combatcheck":
        // Handle combat check
        break
      default:
        // Handle other roll types
        break
    }
  }

  /** @override */
  _onDragStart(event) {
    const target = event.currentTarget
    let dragData

    // Si c'est une action : dataset contient itemUuid et indice
    if (target.classList.contains("action")) {
      const { id } = foundry.utils.parseUuid(target.dataset.itemUuid)
      const indice = target.dataset.indice
      const item = this.document.items.get(id)
      // Get source (item uuid) and indice
      dragData = item.actions[indice].toDragData()
      dragData.name = item.name
      dragData.img = item.img
      dragData.actionName = item.actions[indice].actionName
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
    }
    // Sinon dataset contient itemUuid, itemId, itemType
    else super._onDragStart(event)
  }

  /** @override */
  async _onDrop(event) {
    // On récupère le type et l'uuid de l'item
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)
    const actor = this.document

    // A partir de l'uuid, extraction de primaryId qui est l'id de l'acteur
    let { primaryId } = foundry.utils.parseUuid(data.uuid)
    // Pas de drop d'objet sur soi même
    if (primaryId === actor.id) return

    /**
     * A hook event that fires when some useful data is dropped onto a CharacterSheet.
     * @function dropCharacterSheetData
     * @memberof hookEvents
     * @param {Actor} actor      The Actor
     * @param {ActorSheet} sheet The ActorSheet application
     * @param {object} data      The data that has been dropped onto the sheet
     */
    if (Hooks.call("co.dropCharacterSheetData", actor, this, data) === false) return

    if (data.type !== "Item") return
    return this._onDropItem(event, data)
  }

  /**
   * Handle the drop event for an item.
   *
   * @param {Event} event The drop event.
   * @param {Object} data The data associated with the dropped item.
   * @returns {Promise<boolean>} - Returns false if the actor is not the owner or if the item type is not handled.
   */
  async _onDropItem(event, data) {
    event.preventDefault()
    if (!this.document.isOwner) return false
    // On récupère l'item de type COItem
    const item = await Item.implementation.fromDropData(data)

    switch (item.type) {
      case SYSTEM.ITEM_TYPE.equipment.id:
        return await this.document.addEquipment(item)
      case SYSTEM.ITEM_TYPE.feature.id:
        return await this.document.addFeature(item)
      case SYSTEM.ITEM_TYPE.profile.id:
        return await this.document.addProfile(item)
      case SYSTEM.ITEM_TYPE.path.id:
        return await this.document.addPath(item)
      case SYSTEM.ITEM_TYPE.capacity.id:
        // Soit on dépose n'importe où sur la feuille, soit on dépose dans une zone prévue pour y ajouter des 'sous-capacités' (dropZone)
        const isDropZone = await this.isDropZone(event)
        // Zone pour une sous capacité
        if (isDropZone) {
          // C'est une sous capacité on cherche la capacité parente
          let parentItem = event.target.closest(".item-list")
          let parentItemUuid = parentItem.dataset.itemUuid
          return await this.document.addLinkedCapacity(item, parentItemUuid)
        } else {
          return await this.document.addCapacity(item, null)
        }
      default:
        return false
    }
  }

  /** Vérifie si une balise parent à une classe 'dropzone'
   * @param {event} event
   * @returns {bool} true si oui false si non
   */
  async isDropZone(event) {
    if (event.target.tagName === "DIV" && event.target.classList.contains("dropzone")) return true // Si la balise elle même est une dropzone
    let parent = event.target.parentElement

    // Remontez dans l'arborescence DOM pour trouver un parent <div> avec la classe "dropzone"
    while (parent) {
      if (parent.tagName === "DIV" && parent.classList.contains("dropzone")) {
        return true
      }
      parent = parent.parentElement
    }
    return false
  }

  async _handleDef(effect, state) {
    // On ne peut pas activer à la fois la défense partielle et la défense totale
    if (effect === "partialDef" && state) {
      if (this.actor.hasEffect("fullDef")) {
        return ui.notifications.warn(game.i18n.localize("CO.notif.cantUseAllDef"))
      }
    }
    if (effect === "fullDef" && state) {
      if (this.actor.hasEffect("partialDef")) {
        return ui.notifications.warn(game.i18n.localize("CO.notif.cantUseAllDef"))
      }
    }

    const hasEffect = this.actor.statuses.has(effect)
    if (hasEffect && state === false) return await this.actor.toggleStatusEffect(effect, state)
    if (!hasEffect && state === true) return await this.actor.toggleStatusEffect(effect, state)
  }

  static async #onActivateDef(event, target) {
    const effect = target.dataset.effect
    this._handleDef(effect, true)
  }

  static async #onDeactivateDef(event, target) {
    const effect = target.dataset.effect
    this._handleDef(effect, false)
  }
}
