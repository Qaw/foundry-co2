import { SYSTEM } from "../../config/system.mjs"
/**
 * La class Condition représente un contrôle de condition qui peux être évalué pour un élément donné.
 * subject l'element à vérifier.
   predicate ce que l'on veux utiliser pour évaluer la condition.
   object l'objet ou la cible à atteindre de la condition, ou '_self' pour se référer à l'élément évalué.
 */
export class Condition extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      subject: new fields.StringField({ required: true, initial: "item" }),
      predicate: new fields.StringField({ required: true, initial: "isEquipped" }),
      object: new fields.StringField({ required: true, initial: "_self" }),
    }
  }

  /**
   * Renvoi un objet contenant les méthodes de conditions disponibles.
   * @returns {object} An object containing condition methods.
   */
  get conditions() {
    return {
      isEquipped: this.isEquipped,
      isOwned: this.isOwned,
      isLearned: this.isLearned,
      isTagged: this.isTagged,
      isEqualTo: this.isEqualTo,
      isSuccess: this.isSuccess,
      isFailure: this.isFailure,
      isCritique: this.isCritique,
      isAbilityType: this.isAbilityType,
      formula: this.formula,
      melee: this.melee,
      ranged: this.ranged,
      magical: this.magical,
      noarmor: this.noarmor,
    }
  }

  /**
   * Vérifie si l'item est équipé.
   * @param {object} condition L'objet condition.
   * @param {object} object L'objet à vérifier.
   * @param {object} item L'item à vérifier.
   * @returns {boolean} True si l'item est équipé, false sinon.
   */
  isEquipped(condition, object, item) {
    return item.type === SYSTEM.ITEM_TYPE.equipment.id ? item.system.equipped : false
  }

  /**
   * Checks if the item is owned.
   * @param {object} condition The condition object.
   * @param {object} object The object to check.
   * @param {object} item The item to check.
   * @returns {boolean} True if the item is owned, false otherwise.
   */
  isOwned(condition, object, item) {
    // Implement the isOwned condition
    return false
  }

  /**
   * Checks if the capacity is learned.
   * @param {object} condition The condition object.
   * @param {object} object The object to check.
   * @param {object} item The item to check.
   * @returns {boolean} True if the capacity is learned, false otherwise.
   */
  isLearned(condition, object, item) {
    return item.type === SYSTEM.ITEM_TYPE.capacity.id ? item.system.learned : false
  }

  /**
   * Placeholder for the isTagged condition.
   * @param {object} condition The condition object.
   * @param {object} object The object to check.
   * @param {object} item The item to check.
   * @returns {boolean} To be implemented.
   */
  isTagged(condition, object, item) {
    // Implement the isTagged condition
    return false
  }

  isEqualTo(condition, object, item) {
    //to do : à faire
    return false
  }

  isSuccess(condition, object, item) {
    //to do : à faire
    return false
  }

  isFailure(condition, object, item) {
    //to do : à faire
    return false
  }

  isCritique(condition, object, item) {
    //to do : à faire
    return false
  }

  isAbilityType(condition, object, item) {
    //to do : à faire
    return false
  }

  formula(condition, object, item) {
    //to do : à faire
    return false
  }

  melee(condition, object, item) {
    //to do : à faire
    return false
  }

  ranged(condition, object, item) {
    //to do : à faire
    return false
  }

  magical(condition, object, item) {
    //to do : à faire
    return false
  }

  noarmor(condition, object, item) {
    //to do : à faire
    return false
  }

  /**
   * Evaluates the condition for a given item.
   * @param {object} item The item to evaluate the condition for.
   * @returns {boolean} The result of the condition evaluation.
   * @throws {Error} If the specified predicate is not a valid condition method.
   */
  async evaluate(item) {
    const obj = await this.getObject(item)
    this.validatePredicate()
    return this.conditions[this.predicate](this, obj, item)
  }

  /**
   * Retrieves the object based on the condition's object property.
   * @param {_self|UUID} item The item to retrieve the object for.
   * @returns {object} The retrieved object.
   */
  async getObject(item) {
    return this.object === "_self" ? item : await fromUuid(item.uuid)
  }

  /**
   * Validates the predicate to ensure it is a valid condition method.
   * @throws {Error} If the predicate is not valid.
   */
  validatePredicate() {
    if (!Object.prototype.hasOwnProperty.call(this.conditions, this.predicate)) {
      throw new Error(`Invalid predicate ${this.predicate}`)
    }
  }
}
