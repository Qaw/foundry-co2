import CoBaseItemSheetV2 from "./base-item-sheet.mjs"

export default class CoPathSheetV2 extends CoBaseItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["path"],
    position: {
      width: 600,
      height: 720,
    },
  }

  static PARTS = {
    header: { template: "systems/co/templates/v2/items/shared/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    description: { template: "systems/co/templates/v2/items/shared/description.hbs" },
    details: { template: "systems/co/templates/v2/items/path.hbs" },
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

    console.log(`CoPathSheetv2 - context`, context)
    return context
  }
}
