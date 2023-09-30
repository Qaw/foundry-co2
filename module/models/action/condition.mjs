import { ITEM_TYPE } from "../../system/constants.mjs";
/**
 * The Condition class represents a conditional check that can be evaluated for a given item.
 */
export class Condition {
  /**
   * Constructs a new Condition instance.
   * @param {string} subject - The subject of the condition.
   * @param {string} predicate - The predicate or method to evaluate the condition.
   * @param {string} object - The object of the condition, or '_self' to refer to the item being evaluated.
   */
  constructor(subject, predicate, object) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
  }

  /**
   * Returns an object containing the available condition methods.
   * isEquipped : is the item equiped
   * isOwned : is the item in the inventory
   * isLearned : is the capacity learned
   * isTagged : To Do
   * @returns {object} An object containing condition methods.
   */
  get conditions() {
    return {
      isEquipped: (condition, object, item) => (item.type === ITEM_TYPE.EQUIPMENT ? item.system.equipped : false),
      isOwned: (condition, object, item) => (item.isOwned),
      isLearned: (condition, object, item) => (item.type === ITEM_TYPE.CAPACITY ? item.system.learned : false),
      isTagged: (condition, object, item) => {
        // Implement the isTagged condition
      },
    };
  }

  /**
   * Evaluates the condition for a given item.
   * @param {object} item - The item to evaluate the condition for.
   * @returns {boolean} The result of the condition evaluation.
   * @throws {Error} If the specified predicate is not a valid condition method.
   */
  evaluate(item) {
    const obj = this.object === "_self" ? item : fromUuid(item);
    if (!Object.prototype.hasOwnProperty.call(this.conditions, this.predicate)) {
      throw new Error(`Invalid predicate ${this.predicate} for item ${obj.name} with Id ${obj.id}`);
    }

    return this.conditions[this.predicate](this, obj, item);
  }
}
