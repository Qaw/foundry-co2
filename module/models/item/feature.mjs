import { CommonData } from "./schemas/common.mjs"

export class FeatureData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      common: new fields.EmbeddedDataField(CommonData),
      subtype: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      paths: new fields.ArrayField(new fields.StringField()),
      capacities: new fields.ArrayField(new fields.StringField()),
    }
  }
}
