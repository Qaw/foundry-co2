import ItemData from "./item.mjs"

export default class ProfileData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      family: new fields.StringField({
        required: false,
        nullable: true,
      }),
      pv: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 3 }),
      recovery: new fields.StringField({
        required: true,
        nullable: false,
        initial: "d6",
      }),
      proficiencies: new fields.ArrayField(new fields.StringField()),
      paths: new fields.ArrayField(new fields.StringField()),
      martialTrainingsWeapons: new fields.ObjectField(),
      martialTrainingsArmors: new fields.ObjectField(),
      martialTrainingsShields: new fields.ObjectField(),
      spellcasting: new fields.StringField({
        required: true,
        nullable: false,
        initial: "vol",
      }),
    })
  }
}
