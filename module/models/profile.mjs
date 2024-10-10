import ItemData from "./item.mjs"
import { SYSTEM } from "../config/system.mjs"

export default class ProfileData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      family: new fields.StringField({ required: false, nullable: true }),
      proficiencies: new fields.ArrayField(new fields.StringField()),
      paths: new fields.ArrayField(new fields.StringField()),
      martialTrainingsWeapons: new fields.ObjectField(),
      martialTrainingsArmors: new fields.ObjectField(),
      martialTrainingsShields: new fields.ObjectField(),
    })
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData()
    this.hp = SYSTEM.FAMILIES[this.family].hp
    this.fp = SYSTEM.FAMILIES[this.family].fp
    this.recoveryDice = SYSTEM.FAMILIES[this.family].recoveryDice
    this.recoveryBonus = SYSTEM.FAMILIES[this.family].recoveryBonus
  }
}
