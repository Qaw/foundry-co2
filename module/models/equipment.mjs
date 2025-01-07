import ItemData from "./item.mjs"
import { Action } from "./schemas/action.mjs"
export default class EquipmentData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({ required: true }),
      martialCategory: new fields.StringField({ required: true }),
      quantity: new fields.SchemaField({
        current: new fields.NumberField({ required: true, nullable: false, initial: 1, integer: true }),
        max: new fields.NumberField({ required: true, nullable: false, initial: 1, integer: true }),
        destroyIfEmpty: new fields.BooleanField(),
      }),
      charges: new fields.SchemaField({
        current: new fields.NumberField({ integer: true }),
        max: new fields.NumberField({ integer: true }),
        destroyIfEmpty: new fields.BooleanField(),
      }),
      weight: new fields.SchemaField({
        value: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        unit: new fields.StringField({ required: true, initial: "kg" }),
      }),
      price: new fields.SchemaField({
        value: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        unit: new fields.StringField({ required: true }),
      }),
      rarity: new fields.StringField({ required: true }),
      equipped: new fields.BooleanField(),
      properties: new fields.SchemaField({
        equipable: new fields.BooleanField(),
        reloadable: new fields.BooleanField(),
        stackable: new fields.BooleanField(),
      }),
      usage: new fields.SchemaField({
        oneHand: new fields.BooleanField(),
        twoHand: new fields.BooleanField(),
      }),
      actions: new fields.ArrayField(new fields.EmbeddedDataField(Action)),
    })
  }
}
