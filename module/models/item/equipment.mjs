import ItemData from "./item.mjs"
export class EquipmentData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      martialCategory: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      quantity: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 1,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 1,
          integer: true,
        }),
        destroyIfEmpty: new fields.BooleanField({
          required: true,
          initial: false,
        }),
      }),
      charges: new fields.SchemaField({
        current: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
        }),
        max: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
        }),
        destroyIfEmpty: new fields.BooleanField({
          required: false,
          initial: false,
        }),
      }),
      weight: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
          integer: true,
        }),
        unit: new fields.StringField({
          required: true,
          nullable: false,
          initial: "kg",
        }),
      }),
      price: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
          integer: true,
        }),
        unit: new fields.StringField({
          required: true,
          nullable: false,
          initial: "",
        }),
      }),
      rarity: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      properties: new fields.SchemaField({
        equipable: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
        reloadable: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
        stackable: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      }),
      usage: new fields.SchemaField({
        oneHand: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
        twoHand: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      }),
      actions: new fields.ArrayField(new fields.ObjectField()),
    })
  }
}
