import CoBaseItemSheetV2 from "./base-item-sheet-v2.mjs"

export default class CoCapacitySheetV2 extends CoBaseItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["capacity"],
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
    details: { template: "systems/co/templates/v2/items/capacity.hbs" },
    actions: {
      template: "systems/co/templates/v2/items/shared/actions.hbs",
      templates: [
        "systems/co/templates/v2/items/parts/conditions-part.hbs",
        "systems/co/templates/v2/items/parts/modifiers-part.hbs",
        "systems/co/templates/v2/items/parts/resolvers-part.hbs",
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
      labelPrefix: "CO.sheet.tabs.capacity",
    },
  }

  #actionTabSelected = null

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options)
    switch (partId) {
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
