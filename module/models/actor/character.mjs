import { AbilityValue } from "./schemas/ability-value.mjs";
import { BaseValue } from "./schemas/base-value.mjs";

export class CharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.abilities = new fields.SchemaField(
      Object.values(SYSTEM.ABILITIES).reduce((obj, ability) => {
        obj[ability.id] = new fields.EmbeddedDataField(AbilityValue, { label: ability.label, nullable: false });
        return obj;
      }, {})
    );

    schema.combat = new fields.SchemaField(
      Object.values(SYSTEM.COMBAT).reduce((obj, combat) => {
        const initial = {
          base: 0,
          ability: combat.ability,
          bonuses: {
            sheet: 0,
            effects: 0
          },
        };
        obj[combat.id] = new fields.EmbeddedDataField(BaseValue, { label: combat.label, nullable: false, initial: initial });
        return obj;
      }, {})
    );

    schema.attributes = new fields.SchemaField({
      movement: new fields.EmbeddedDataField(BaseValue, {
        label: "CO.label.long.movement",
        nullable: false,
        initial: { base: 10, unit: "m", bonuses: { sheet: 0, effects: 0 } },
      }),
      level: new fields.EmbeddedDataField(BaseValue, {
        label: "CO.label.long.level",
        nullable: false,
        initial: {base: 1, bonuses: {sheet: 0, effects: 0}}
      }),
      encumbrance: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        encumbered: new fields.BooleanField({
          required: true,
          initial: false,
        }),
      }),
      hp: new fields.SchemaField(
        {
          base: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          temp: new fields.NumberField({
            required: true,
            nullable: true,
            initial: null,
            integer: true
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          tempmax: new fields.NumberField({
            required: true,
            nullable: true,
            initial: null,
            integer: true
          }),
          bonuses: new fields.SchemaField({
            sheet: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            effects: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          }),
        },
        { label: "CO.label.long.hp", nullable: false }
      ),
      xp: new fields.SchemaField(
        {
          value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        },
        { label: "CO.label.long.xp", required: true, nullable: false }
      )
    });

    const resourceField = (label) =>
      new fields.SchemaField(
        {
          base: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          bonuses: new fields.SchemaField({
            sheet: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            effects: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          }),
        },
        { label, nullable: false }
      );

    schema.resources = new fields.SchemaField(
      Object.values(SYSTEM.RESOURCES).reduce((obj, resource) => {
        obj[resource.id] = resourceField(resource.label);
        return obj;
      }, {})
    );

    schema.details = new fields.SchemaField({
      biography: new fields.SchemaField({
        private: new fields.HTMLField(),
        public: new fields.HTMLField(),
      }),
      appearance: new fields.SchemaField({
        private: new fields.HTMLField(),
        public: new fields.HTMLField(),
      }),
      notes: new fields.SchemaField({
        private: new fields.HTMLField(),
        public: new fields.HTMLField(),
      }),
      size: new fields.StringField({
        required: false,
        nullable: true,
        initial: "medium"
      }),
      languages: new fields.ArrayField(new fields.StringField())
    });

    return schema;
  }
}
