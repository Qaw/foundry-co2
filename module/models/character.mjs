import { SYSTEM } from "../config/system.mjs"
import { BaseValue } from "./schemas/base-value.mjs"
import ActorData from "./actor.mjs"

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

  /**
   * Retrieves an array of ability modifiers from various sources associated with the character.
   *
   * @returns {Array} An array of ability modifiers.
   */
  get abilityModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.ability.id)
  }

  /**
   * Retrieves an array of combat modifiers from various sources associated with the character.
   *
   * @returns {Array} An array of combat modifiers.
   */
  get combatModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.combat.id)
  }

  /**
   * Retrieves the attribute modifiers for the character.
   *
   * @returns {Array} An array of attribute modifiers.
   */
  get attributeModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.attribute.id)
  }

  /**
   * Gets the resource modifiers for the character.
   *
   * @returns {Array} An array of resource modifiers.
   */
  get resourceModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.resource.id)
  }

  /**
   * Retrieves the skill modifiers for the character.
   *
   * @returns {Array} An array of skill modifiers.
   */
  get skillModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.skill.id)
  }

  /**
   * Return the total modifier and the tooltip for the given target and an array of modifiers.
   * @param {Array} modifiers An array of modifier objects.
   * @param {SYSTEM.MODIFIERS.MODIFIER_TARGET} target The target for which the modifiers are filtered.
   **/
  computeTotalModifiersByTarget(modifiers, target) {
    if (!modifiers) return { total: 0, tooltip: "" }

    let modifiersByTarget = modifiers.filter((m) => m.target === target)

    let total = modifiersByTarget.map((i) => i.evaluate(this.parent)).reduce((acc, curr) => acc + curr, 0)

    let tooltip = ""
    for (const modifier of modifiersByTarget) {
      let partialTooltip = modifier.getTooltip(this.parent)
      if (partialTooltip !== null) tooltip += partialTooltip
    }

    return { total: total, tooltip: tooltip }
  }

  /**
   * Retrieves an array of modifiers from various sources associated with the character.
   * The sources include features, profiles, capacities, and equipment.
   * Each source is checked for enabled modifiers of the specified type and subtype.
   *
   * @param {string} subtype - The subtype of the modifier.
   * @returns {Array} An array of modifiers.
   */
  _getModifiers(subtype) {
    const sources = ["features", "profiles", "capacities", "equipments"]
    let modifiersArray = []

    sources.forEach((source) => {
      let items = this.parent[source]
      if (items) {
        let allModifiers = items.reduce((mods, item) => mods.concat(item.enabledModifiers), []).filter((m) => m.subtype === subtype)
        modifiersArray.push(...allModifiers)
      }
    })

    return modifiersArray
  }
}
