export default class ItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      description: new fields.HTMLField(),
      source: new fields.StringField({
        required: false,
        nullable: true,
        initial: "",
      }),
      origin: new fields.StringField({
        required: false,
        nullable: true,
        initial: "",
      }),
      slug: new fields.StringField({
        required: false,
        nullable: true,
        initial: "",
      }),
      tags: new fields.ArrayField(new fields.StringField()),
    }
  }

  /** @override */
  prepareDerivedData() {
    this.slug = this.parent.name.slugify({ strict: true })
  }
}
