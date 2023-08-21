export class CommonData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.SchemaField({
        value: new fields.HTMLField(),
        chat: new fields.HTMLField()
      }),
      source: new fields.StringField({
        required: false,
        nullable: true,
        initial: ""
      }),
      origin: new fields.StringField({
        required: false,
        nullable: true,
        initial: ""
      }),
      slug: new fields.StringField({
        required: false,
        nullable: true,
        initial: ""
      }),
      tags: new fields.ArrayField(new fields.StringField())
    };
  }
}
