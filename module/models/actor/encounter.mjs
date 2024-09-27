import { BaseValue } from "./schemas/base-value.mjs"
import { AttackData } from "./schemas/attack.mjs"
import ActorData from "./actor.mjs"

export default class EncounterData extends ActorData {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.combat = new fields.SchemaField({
      init: new fields.EmbeddedDataField(BaseValue),
      def: new fields.EmbeddedDataField(BaseValue),
    })

    schema.attacks = new fields.ArrayField(new fields.EmbeddedDataField(AttackData))

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

    return foundry.utils.mergeObject(super.defineSchema(), schema)
  }
}
