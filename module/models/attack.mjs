import ItemData from "./item.mjs"
import { Action } from "./schemas/action.mjs"
export default class AttackData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields

    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      learned: new fields.BooleanField({
        required: true,
        initial: false,
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
      }),
      properties: new fields.SchemaField({
        spell: new fields.BooleanField({
          required: true,
          initial: false,
        }),
        chargeable: new fields.BooleanField({
          required: true,
          initial: false,
        }),
      }),
      actions: new fields.ArrayField(new fields.EmbeddedDataField(Action)),
    })
  }

  // FIXME : à revoir
  get displayValues() {
    let attack = ""
    let damage = ""
    let source = ""
    let actions = this.actions
    if (actions.length > 0) {
      let action = Action.createFromExisting(actions[0])
      if (action.hasResolvers) {
        let resolver = action.resolvers[0]
        attack = resolver?.skill?.formula[0].part
        damage = resolver?.dmg?.formula[0].part
      }
      source = action.source
    }
    return { attack, damage, source }
  }
}
