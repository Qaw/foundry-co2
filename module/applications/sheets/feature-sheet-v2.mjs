import CoBaseItemSheetV2 from "./base-item-sheet-v2.mjs"

export default class CoFeatureSheetV2 extends CoBaseItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["feature"],
    position: {
      width: 600,
      height: 720,
    },
  }

  /** @override */
  static PARTS = {
    header: { template: "systems/co/templates/v2/items/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    description: { template: "systems/co/templates/v2/items/description.hbs" },
    details: { template: "systems/co/templates/v2/items/profile.hbs" },
  }

  /** @override */
  static TABS = {
    primary: {
      tabs: [
        { id: "description", icon: "fa-solid fa-file-alt" },
        { id: "details", icon: "fa-solid fa-image" },
      ],
      initial: "details",
      labelPrefix: "CO.sheet.tabs.feature",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    console.log(`CoFeatureSheetv2 - context`, context)
    return context
  }
}
