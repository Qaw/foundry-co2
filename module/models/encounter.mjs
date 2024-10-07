import { SYSTEM } from "../config/system.mjs"
import { BaseValue } from "./schemas/base-value.mjs"
import ActorData from "./actor.mjs"

export default class EncounterData extends ActorData {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.combat = new fields.SchemaField({
      init: new fields.EmbeddedDataField(BaseValue),
      def: new fields.EmbeddedDataField(BaseValue),
    })

    schema.pasteData = new fields.HTMLField()
    schema.details = new fields.SchemaField({
      archetype: new fields.StringField({
        required: false,
        nullable: true,
        initial: SYSTEM.ENCOUNTER_ARCHETYPES.standard,
        options: SYSTEM.ENCOUNTER_ARCHETYPES,
      }),
      category: new fields.StringField({
        required: false,
        nullable: true,
        initial: SYSTEM.ENCOUNTER_CATEGORIES.humanoid,
        options: SYSTEM.ENCOUNTER_CATEGORIES,
      }),
      size: new fields.StringField({
        required: false,
        nullable: true,
        initial: SYSTEM.SIZES.medium,
        options: SYSTEM.SIZES,
      }),
      bossRank: new fields.StringField({
        required: false,
        nullable: true,
        initial: SYSTEM.ENCOUNTER_BOSS_RANKS.noboss,
        options: SYSTEM.ENCOUNTER_BOSS_RANKS,
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
