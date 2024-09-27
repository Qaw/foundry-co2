import ItemData from "./item.mjs"

export default class PathData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      capacities: new fields.ArrayField(new fields.StringField()),
      rank: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        integer: true,
      }),
    })
  }
}
