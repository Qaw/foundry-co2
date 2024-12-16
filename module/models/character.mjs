import { PROFILE_FAMILY, SYSTEM } from "../config/system.mjs"
import { BaseValue } from "./schemas/base-value.mjs"
import ActorData from "./actor.mjs"
import { Modifiers } from "./action/modifiers.mjs"
import Utils from "../utils.mjs"


export default class CharacterData extends ActorData {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}

    schema.combat = new fields.SchemaField(
      Object.values(SYSTEM.COMBAT).reduce((obj, combat) => {
        const initial = {
          base: 0,
          ability: combat.ability,
          bonuses: {
            sheet: 0,
            effects: 0,
          },
        }
        obj[combat.id] = new fields.EmbeddedDataField(BaseValue, { label: combat.label, nullable: false, initial: initial })
        return obj
      }, {}),
    )

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
        { label, nullable: false },
      )

    schema.resources = new fields.SchemaField(
      Object.values(SYSTEM.RESOURCES).reduce((obj, resource) => {
        obj[resource.id] = resourceField(resource.label)
        return obj
      }, {}),
    )

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
        initial: "medium",
      }),
      languages: new fields.ArrayField(new fields.StringField()),
    })

    return foundry.utils.mergeObject(super.defineSchema(), schema)
  }

  /** @override */
  prepareBaseData() {
    // Calcul de la base de PV sans le bonus de constitution
    // Au niveau 1 : 2 * PV de la famille
    // Pour chaque niveau supplémentaire : + PV de la famille
    const pvFromFamily = this.profile ? SYSTEM.FAMILIES[this.profile.system.family].hp : 0
    this.attributes.hp.base = 2 * pvFromFamily + (this.attributes.level - 1) * pvFromFamily
  }

  get fpFromFamily() {
    return this.profile ? SYSTEM.FAMILIES[this.profile.system.family].fp : 0
  }

  get rpFromFamily() {
    return this.profile ? SYSTEM.FAMILIES[this.profile.system.family].recoveryBonus : 0
  }

  /**
   * Retrieves the profile item from the items array.
   *
   * @returns {Object|undefined} The profile item if found, otherwise undefined.
   */
  get profile() {
    return this.parent.items.find((item) => item.type === SYSTEM.ITEM_TYPE.PROFILE)
  }

  get profiles() {
    return this.parent.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.PROFILE)
  }
}
