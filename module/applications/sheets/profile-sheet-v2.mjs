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
    details: { template: "systems/co/templates/v2/items/profile.hbs", scrollable: [""] },
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

    context.martialTrainingsWeaponsList = game.system.CONST.martialTrainingsWeapons
    context.martialTrainingsArmorsList = game.system.CONST.martialTrainingsArmors
    context.martialTrainingsShieldsList = game.system.CONST.martialTrainingsShields

    context.martialTrainingsWeapons = context.martialTrainingsWeaponsList.filter((i) => this.item.system.martialTrainingsWeapons[i.key] === true)
    context.martialTrainingsArmors = context.martialTrainingsArmorsList.filter((i) => this.item.system.martialTrainingsArmors[i.key] === true)
    context.martialTrainingsShields = context.martialTrainingsShieldsList.filter((i) => this.item.system.martialTrainingsShields[i.key] === true)

    let infosPaths = []
    for (const path of this.item.system.paths) {
      let item = await fromUuid(path)
      // Item could be null if the item has been deleted in the compendium
      if (item) {
        infosPaths.push(item.infos)
      }
    }
    context.paths = infosPaths

    // Select options
    context.choiceProfileFamily = Object.fromEntries(Object.entries(SYSTEM.FAMILIES).map(([key, value]) => [key, value.label]))

    console.log(`CoProfileSheetv2 - context`, context)
    return context
  }
}
