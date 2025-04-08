import { AbilityValue } from "./schemas/ability-value.mjs"

export default class ActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }

    const schema = {}

    schema.abilities = new fields.SchemaField(
      Object.values(SYSTEM.ABILITIES).reduce((obj, ability) => {
        obj[ability.id] = new fields.EmbeddedDataField(AbilityValue, { label: ability.label, nullable: false })
        return obj
      }, {}),
    )

    return schema
  }

  /** @override */
  prepareDerivedData() {
    this.slug = this.parent.name.slugify({ strict: true })
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
   * Gets the resource modifiers for the character.
   *
   * @returns {Array} An array of resource modifiers.
   */
  get resourceModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.resource.id)
  }

  /**
   * Retrieves the state modifiers for the character.
   *
   * @returns {Array} An array of state modifiers.
   */
  get stateModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.state.id)
  }

  /**
   * Retrieves the bonusDice modifiers for the character.
   *
   * @returns {Array} An array of state modifiers.
   */
  get bonusDiceModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.bonusDice.id)
  }

  /**
   * Retrieves the malusDice modifiers for the character.
   *
   * @returns {Array} An array of state modifiers.
   */
  get malusDiceModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.malusDice.id)
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
   * Retrieves the skill modifiers for the character.
   *
   * @returns {Array} An array of skill modifiers.
   */
  get skillModifiers() {
    return this._getModifiers(SYSTEM.MODIFIERS_SUBTYPE.skill.id)
  }
}
