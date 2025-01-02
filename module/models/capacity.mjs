import ItemData from "./item.mjs"
import { Action } from "./schemas/action.mjs"
export default class CapacityData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({ required: true, nullable: false, initial: "" }),
      learned: new fields.BooleanField({}),
      charges: new fields.SchemaField({
        current: new fields.NumberField({ required: false, nullable: true, integer: true }),
        max: new fields.NumberField({ required: false, nullable: true, integer: true }),
      }),
      properties: new fields.SchemaField({
        spell: new fields.BooleanField({}),
        chargeable: new fields.BooleanField({}),
      }),
      path: new fields.StringField({ required: true, nullable: true, initial: null }),
      actions: new fields.ArrayField(new fields.EmbeddedDataField(Action)),
    })
  }

  get isSpell() {
    return this.properties.spell
  }
}
