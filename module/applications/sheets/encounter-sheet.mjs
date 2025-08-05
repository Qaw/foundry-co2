import COBaseActorSheet from "./base-actor-sheet.mjs"
import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"

export default class COEncounterSheet extends COBaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["encounter"],
    position: {
      width: 800,
      height: 600,
    },
    window: {
      contentClasses: ["encounter-content"],
      resizable: true,
    },
    actions: {
      deleteItem: COEncounterSheet.#onDeleteItem,
      roll: COEncounterSheet.#onRoll,
      toggleAction: COEncounterSheet.#onUseAction,
      toggleEffect: COEncounterSheet.#onUseEffect,
    },
  }

  /** @override */
  static PARTS = {
    header: { template: "systems/co/templates/actors/encounter-header.hbs" },
    sidebar: { template: "systems/co/templates/actors/encounter-sidebar.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: "systems/co/templates/actors/encounter-main.hbs", templates: ["systems/co/templates/actors/shared/actions.hbs"] },
    loot: { template: "systems/co/templates/actors/encounter-loot.hbs" },
    paths: { template: "systems/co/templates/actors/shared/paths.hbs", templates: ["systems/co/templates/actors/shared/capacities-nopath.hbs"], scrollable: [""] },
    effects: { template: "systems/co/templates/actors/shared/effects.hbs" },
    notes: { template: "systems/co/templates/actors/encounter-notes.hbs" },
  }

  /** @override */
  static TABS = {
    primary: {
      tabs: [{ id: "main" }, { id: "loot" }, { id: "paths" }, { id: "effects" }, { id: "notes" }],
      initial: "main",
      labelPrefix: "CO.sheet.tabs.encounter",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.attacks = this.actor.system.attacks
    context.attacksActions = this.actor.attacksActions
    context.stateModifiers = this.document.system.stateModifiers
    // Select options
    context.choiceArchetypes = SYSTEM.ENCOUNTER_ARCHETYPES
    context.choiceCategories = SYSTEM.ENCOUNTER_CATEGORIES
    context.choiceBossRanks = SYSTEM.ENCOUNTER_BOSS_RANKS
    context.choiceSizes = SYSTEM.SIZES

    // Enrich notes
    context.enrichedNotesPublic = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.details.notes.public, { async: true })
    context.enrichedNotesPrivate = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.details.notes.private, { async: true })

    // Gestion des défenses
    context.partialDef = this.actor.hasEffect("partialDef")
    context.fullDef = this.actor.hasEffect("fullDef")

    // Gestion des richesses
    context.hasWealth = this.#checkHasWealth(context.system.wealth)

    if (CONFIG.debug.co?.sheets) console.debug(Utils.log(`COEncounterSheet - context`), context)
    return context
  }

  /**
   * Vérifie si le personnage possède au moins une devise
   * @param {Object} wealth L'objet wealth du système
   * @returns {boolean} True si au moins une devise > 0
   * @private
   */
  #checkHasWealth(wealth) {
    if (!wealth || typeof wealth !== "object") return false

    return Object.values(wealth).some((currency) => currency?.value && currency.value > 0)
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)
    // Additional encounter-specific render logic can go here
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
   * Action d'utiliser un effet
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onUseEffect(event, target) {
    event.preventDefault()
    const dataset = target.dataset
    const effectid = dataset.effect
    const action = dataset.action
    let activation = false
    if (action === "activate") {
      activation = this.actor.activateCOStatusEffect({ state: true, effectid })
    } else if (action === "unactivate") {
      activation = this.actor.activateCOStatusEffect({ state: false, effectid })
    }
  }

  /**
   * Delete the selected item
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   */
  static async #onDeleteItem(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const id = li.dataset.itemId
    const uuid = li.dataset.itemUuid
    const type = li.dataset.itemType
    if (!uuid) return
    switch (type) {
      case "path":
        await this.document.deletePath(uuid)
        break
      case "capacity":
        await this.document.deleteCapacity(uuid)
        break
      default:
        await this.document.deleteEmbeddedDocuments("Item", [id])
    }
  }

  /**
   * Handles the deletion of a capacity item from the actor.
   *
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
   * @returns {Promise<void>} A promise that resolves when the capacity item has been deleted.
   */
  static async #onRoll(event, target) {
    const dataset = target.dataset
    const type = dataset.rollType
    const rollTarget = dataset.rollTarget

    switch (type) {
      case "skillcheck":
        this.actor.rollSkill(rollTarget)
      case "combatcheck":
        break
    }
  }

  /** @override */
  _onDragStart(event) {
    if (!game.user.isGM) return
    const target = event.currentTarget
    let dragData

    // Si c'est un des champs de richesse
    if (target.classList.contains("wealth")) {
      const wealthType = target.nextElementSibling.dataset.wealthType
      const wealthValue = this.document.system.wealth[wealthType]?.value
      if (wealthValue === 0) return // Ne pas drag si la richesse est à 0
      dragData = {
        type: "wealth",
        wealthType: wealthType,
        value: wealthValue,
        encounterId: this.document.id,
      }
    }

    // Owned Items
    if (target.dataset.itemId) {
      const item = this.actor.items.get(target.dataset.itemId)
      dragData = item.toDragData()
    }

    // Set data transfer
    if (!dragData) return
    dragData.sourceTransfer = "encounter"
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
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
      case SYSTEM.ITEM_TYPE.capacity.id:
        return await this.document.addCapacity(item, null)
      default:
        return await Item.implementation.create(item.toObject(), { parent: this.actor })
    }
  }
}
