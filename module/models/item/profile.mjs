import { CommonData } from "./schemas/common.mjs"

export class ProfileData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      common: new fields.EmbeddedDataField(CommonData),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      family: new fields.StringField({
        required: false,
        nullable: true,
      }),
      hd: new fields.StringField({
        required: true,
        nullable: false,
        initial: "1d4",
      }),
      proficiencies: new fields.ArrayField(new fields.StringField()),
      paths: new fields.ArrayField(new fields.StringField()),
      martialTrainingsWeapons: new fields.ObjectField(),
      martialTrainingsArmors: new fields.ObjectField(),
      martialTrainingsShields: new fields.ObjectField(),
      spellcasting: new fields.StringField({
        required: true,
        nullable: false,
        initial: "int",
      }),
      mpFormula: new fields.StringField({
        required: true,
        nullable: true,
        initial: "@lvl + @int",
      }),
    }
  }
}
