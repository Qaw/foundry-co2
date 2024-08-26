import { AbilityModifier } from "./schemas/ability-mod.mjs"
import { BaseValue } from "./schemas/base-value.mjs"
import { AttackData } from "./schemas/attack.mjs"

export class EncounterData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }

    const schema = {}

    schema.abilities = new fields.SchemaField(
      Object.values(SYSTEM.ABILITIES).reduce((obj, ability) => {
        obj[ability.id] = new fields.EmbeddedDataField(AbilityModifier, { label: ability.label, nullable: false })
        return obj
      }, {}),
    )

    schema.combat = new fields.SchemaField({
      init: new fields.EmbeddedDataField(BaseValue),
      def: new fields.EmbeddedDataField(BaseValue),
    })

    schema.attacks = new fields.ArrayField(new fields.EmbeddedDataField(AttackData))

    schema.attributes = new fields.SchemaField({
      hp: new fields.SchemaField(
        {
          base: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          temp: new fields.NumberField({
            required: true,
            nullable: true,
            initial: null,
            integer: true,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          tempmax: new fields.NumberField({
            required: true,
            nullable: true,
            initial: null,
            integer: true,
          }),
          bonuses: new fields.SchemaField({
            sheet: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            effects: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          }),
        },
        { label: "CO.label.long.hp", nullable: false },
      ),
      movement: new fields.EmbeddedDataField(BaseValue, {
        label: "CO.label.long.movement",
        nullable: false,
        initial: { base: 10, unit: "m", bonuses: { sheet: 0, effects: 0 } },
      }),
      level: new fields.EmbeddedDataField(BaseValue, {
        label: "CO.label.long.level",
        nullable: false,
        initial: { base: 1, bonuses: { sheet: 0, effects: 0 } },
      }),
    })
    schema.pasteData = new fields.HTMLField()
    schema.details = new fields.SchemaField({
      archetype: new fields.StringField({
        required: false,
        nullable: true,
        initial: game.co.config.encounter.archetypes.standard,
        options: game.co.config.encounter.archetypes,
      }),
      category: new fields.StringField({
        required: false,
        nullable: true,
        initial: game.co.config.encounter.categories.humanoid,
        options: game.co.config.encounter.categories,
      }),
      size: new fields.StringField({
        required: false,
        nullable: true,
        initial: game.co.config.encounter.sizes.medium,
        options: game.co.config.encounter.sizes,
      }),
      bossRank: new fields.StringField({
        required: false,
        nullable: true,
        initial: game.co.config.encounter.bossRank.noboss,
        options: game.co.config.encounter.bossRank,
      }),
      description: new fields.SchemaField({
        private: new fields.HTMLField(),
        public: new fields.HTMLField(),
      }),
      notes: new fields.SchemaField({
        private: new fields.HTMLField(),
        public: new fields.HTMLField(),
      }),
      languages: new fields.ArrayField(new fields.StringField()),
    })

    return schema
  }
}
