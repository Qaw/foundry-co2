import CoBaseItemSheetV2 from "./base-item-sheet-v2.mjs"

export default class CoEquipmentSheetv2 extends CoBaseItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    position: {
      width: 600,
      height: 720,
    },
  }

  /** @override */
  static PARTS = {
    header: { template: "systems/co/templates/v2/items/shared/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    description: { template: "systems/co/templates/v2/items/shared/description.hbs" },
    details: { template: "systems/co/templates/v2/items/equipment.hbs" },
    actions: {
      template: "systems/co/templates/v2/items/shared/actions.hbs",
      templates: [
        "systems/co/templates/v2/items/parts/conditions-part.hbs",
        "systems/co/templates/v2/items/parts/modifiers-part.hbs",
        "systems/co/templates/v2/items/parts/modifier.hbs",
        "systems/co/templates/v2/items/parts/resolvers-part.hbs",
        "systems/co/templates/v2/items/parts/resolver-part.hbs",
      ],
      scrollable: [""],
    },
  }

  /** @override */
  static TABS = {
    primary: {
      tabs: [
        { id: "description", icon: "fa-solid fa-file-alt" },
        { id: "details", icon: "fa-solid fa-image" },
        { id: "actions", icon: "fa-solid fa-grid" },
      ],
      initial: "details",
      labelPrefix: "CO.sheet.tabs.equipment",
    },
  }

  #actionTabSelected = null

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    context.resolverSystemFields = this.document.system.schema.fields.actions.element.fields.resolvers.element.fields

    console.log(`CoEquipmentSheetv2 - context`, context)
    return context
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options)
    const doc = this.document
    switch (partId) {
      case "description":
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true })
        break

      case "details":
        // Select options
        // Transformation du tableau d'objets en objet
        context.martialTrainingsWeaponsList = game.system.CONST.martialTrainingsWeapons.reduce((acc, item) => {
          acc[item.key] = item.label
          return acc
        }, {})

        context.martialTrainingsArmorsList = game.system.CONST.martialTrainingsArmors.reduce((acc, item) => {
          acc[item.key] = item.label
          return acc
        }, {})

        context.martialTrainingsShieldsList = game.system.CONST.martialTrainingsShields.reduce((acc, item) => {
          acc[item.key] = item.label
          return acc
        }, {})

        context.choiceEquipmentSubTypes = SYSTEM.EQUIPMENT_SUBTYPES
        context.choiceEquipmentRarity = SYSTEM.EQUIPMENT_RARITY
        context.choiceDamageType = SYSTEM.EQUIPMENT_DAMAGETYPE

        //
        context.isWeapon = doc.system.isWeapon
        context.isArmor = doc.system.isArmor
        context.isShield = doc.system.isShield
        context.isMisc = doc.system.isMisc
        context.isConsumable = doc.system.isConsumable
        break

      case "actions":
        context.subtabs = this._prepareActionsTabs()
        break
    }
    return context
  }

  _prepareActionsTabs() {
    if (!this.document.system.actions || this.document.system.actions.length === 0) return {}
    const tabs = {}
    for (const [actionId, action] of Object.entries(this.document.system.actions)) {
      if (!action) continue
      const tabId = `action-${actionId}`
      tabs[tabId] = {
        group: "actions",
        id: tabId,
        active: false,
        icon: "fa-solid fa-bolt",
        label: action.name || game.i18n.localize("CO.sheet.tabs.capacity.action"),
      }
    }
    if (this.#actionTabSelected && tabs[this.#actionTabSelected]) {
      tabs[this.#actionTabSelected].active = true
    } else {
      this.#actionTabSelected = "action-0"
      tabs[this.#actionTabSelected].active = true
    }

    return tabs
  }

  /** @inheritDoc */
  changeTab(tab, group, options) {
    super.changeTab(tab, group, options)
    if (group === "actions") {
      this.#onChangeActionTab(tab)
    }
  }

  /* Sauvegarde l'onglet d'action sélectionné */
  #onChangeActionTab(tab) {
    this.#actionTabSelected = tab
  }
}
