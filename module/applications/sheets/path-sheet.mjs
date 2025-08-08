import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoPathSheet extends CoBaseItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["path"],
    position: {
      width: 600,
      height: 500,
    },
  }

  static PARTS = {
    header: { template: "systems/co/templates/items/shared/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    description: { template: "systems/co/templates/items/shared/description.hbs" },
    details: { template: "systems/co/templates/items/path.hbs" },
  }

  static TABS = {
    primary: {
      tabs: [{ id: "description" }, { id: "details" }],
      initial: "details",
      labelPrefix: "CO.sheet.tabs.path",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    context.capacities = await this.item.system.getCapacities()

    // Select options
    context.choicePathSubtypes = SYSTEM.PATH_TYPES

    console.log(`CoPathSheet - context`, context)
    return context
  }
}
