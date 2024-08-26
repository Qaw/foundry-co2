export class AttackData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      name: new fields.StringField({
        required: true,
        nullable: false,
        initial: "Nouvelle Attaque",
      }),
      type: new fields.StringField({
        required: true,
        nullable: false,
        initial: "melee",
      }),
      description: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      mod: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        integer: true,
      }),
      dmg: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
    }
  }
}
