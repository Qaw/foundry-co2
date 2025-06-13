import CoBaseItemSheetV2 from "./base-item-sheet-v2.mjs"

export default class CoProfileSheetV2 extends CoBaseItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["profile"],
    position: {
      width: 600,
      height: 720,
    },
  }

  static PARTS = {
    header: { template: "systems/co/templates/v2/items/shared/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    description: { template: "systems/co/templates/v2/items/shared/description.hbs" },
    details: { template: "systems/co/templates/v2/items/profile.hbs" },
  }

  static TABS = {
    primary: {
      tabs: [
        { id: "description", icon: "fa-solid fa-file-alt" },
        { id: "details", icon: "fa-solid fa-image" },
      ],
      initial: "details",
      labelPrefix: "CO.sheet.tabs.profile",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()

    console.log(`CoProfileSheetv2 - context`, context)
    return context
  }
}
