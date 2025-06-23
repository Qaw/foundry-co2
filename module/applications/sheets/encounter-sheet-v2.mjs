import CoBaseActorSheetV2 from "./base-actor-sheet-v2.mjs"
import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"

export default class COEncounterSheetV2 extends CoBaseActorSheetV2 {
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
      deleteItem: COEncounterSheetV2.#onDeleteItem,
      deletePath: COEncounterSheetV2.#onDeletePath,
      roll: COEncounterSheetV2.#onRoll,
      toggleAction: COEncounterSheetV2.#onUseAction,
      toggleEffect: COEncounterSheetV2.#onUseEffect,
    },
  }

  /** @override */
  static PARTS = {
    header: { template: "systems/co/templates/v2/actors/encounter-header.hbs" },
    sidebar: { template: "systems/co/templates/v2/actors/encounter-sidebar.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: "systems/co/templates/v2/actors/encounter-main.hbs" },
    loot: { template: "systems/co/templates/v2/actors/encounter-loot.hbs" },
    paths: { template: "systems/co/templates/v2/actors/shared/paths.hbs", templates: ["systems/co/templates/v2/actors/shared/capacities-nopath.hbs"], scrollable: [""] },
    effects: { template: "systems/co/templates/v2/actors/shared/effects.hbs" },
    notes: { template: "systems/co/templates/v2/actors/encounter-notes.hbs" },
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

    // Select options
    context.choiceArchetypes = SYSTEM.ENCOUNTER_ARCHETYPES
    context.choiceCategories = SYSTEM.ENCOUNTER_CATEGORIES
    context.choiceBossRanks = SYSTEM.ENCOUNTER_BOSS_RANKS
    context.choiceSizes = SYSTEM.SIZES

    // Gestion des défenses
    context.partialDef = this.actor.hasEffect("partialDef")
    context.fullDef = this.actor.hasEffect("fullDef")

    if (CONFIG.debug.co?.sheets) console.debug(Utils.log(`COEncounterSheetV2 - context`), context)
    return context
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
    const dataset = target.dataset
    const action = dataset.action
    const type = dataset.type
    const source = dataset.source
    const indice = dataset.indice
    if (action === "activate") {
      this.actor.activateAction({ state: true, source, indice, type })
    } else if (action === "unactivate") {
      this.actor.activateAction({ state: false, source, indice, type })
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
    const itemId = li.dataset.itemId
    const itemUuid = li.dataset.itemUuid
    const itemType = li.dataset.itemType
    switch (itemType) {
      case "path":
        await COEncounterSheetV2.#onDeletePath(event, target)
        break
      case "capacity":
        await COEncounterSheetV2.#onDeleteCapacity(event, target, itemUuid)
        break
      default:
        this.document.deleteEmbeddedDocuments("Item", [itemId])
    }
    if (itemType === "path") this._onDeletePath(event)
    else if (itemType === "capacity") this._onDeleteCapacity(event)
    else if (itemType === "feature") this._onDeleteFeature(event)
    else this.actor.deleteEmbeddedDocuments("Item", [itemId])
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
   * @returns {Promise<void>} A promise that resolves when the capacity item has been deleted.
   */
  static async #onDeleteCapacity(event, target) {
    event.preventDefault()
    const li = target.closest(".item")
    const uuid = li.dataset.itemUuid
    await this.document.deleteCapacity(uuid)
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
}
