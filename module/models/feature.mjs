import ItemData from "./item.mjs"

export default class FeatureData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({ required: true }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      paths: new fields.ArrayField(new fields.DocumentUUIDField({ type: "Item" })),
      capacities: new fields.ArrayField(new fields.DocumentUUIDField({ type: "Item" })),
    })
  }
}
