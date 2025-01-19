import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoProfileSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    context.martialTrainingsWeaponsList = game.system.CONST.martialTrainingsWeapons
    context.martialTrainingsArmorsList = game.system.CONST.martialTrainingsArmors
    context.martialTrainingsShieldsList = game.system.CONST.martialTrainingsShields

    let infosPaths = []
    for (const path of this.item.system.paths) {
      let item = await fromUuid(path)
      // Item could be null if the item has been deleted in the compendium
      if (item) {
        infosPaths.push(item.infos)
      }
    }
    context.paths = infosPaths

    context.choiceAtmAbiity = SYSTEM.ATM_ABILITY
    context.choicePv = SYSTEM.PV
    context.choiceRecoveryDices = SYSTEM.RECOVERY_DICES
    context.choiceProfileFamily = SYSTEM.PROFILE_FAMILY

    return context
  }
}
