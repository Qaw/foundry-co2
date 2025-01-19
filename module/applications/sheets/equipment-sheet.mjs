import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoEquipmentSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    context.martialTrainingsWeaponsList = game.system.CONST.martialTrainingsWeapons
    context.martialTrainingsArmorsList = game.system.CONST.martialTrainingsArmors
    context.martialTrainingsShieldsList = game.system.CONST.martialTrainingsShields

    context.choiceEquipmentSubTypes = SYSTEM.EQUIPMENT_SUBTYPES
    context.choiceEquipmentRarity = SYSTEM.EQUIPMENT_RARITY

    return context
  }
}
