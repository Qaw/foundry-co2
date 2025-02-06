import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoEquipmentSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

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

    context.isWeapon = this.item.system.isWeapon
    context.isArmor = this.item.system.isArmor
    context.isShield = this.item.system.isShield
    context.isMisc = this.item.system.isMisc

    return context
  }
}
