import { SYSTEM } from "../../config/system.mjs"
/**
 * The Condition class represents a conditional check that can be evaluated for a given item.
 * subject The subject of the condition.
   predicate The predicate or method to evaluate the condition.
   object The object of the condition, or '_self' to refer to the item being evaluated.
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
   * Returns an object containing the available condition methods.
   * isEquipped : is the item equiped
   * isOwned : is the item in the inventory
   * isLearned : is the capacity learned
   * isTagged : To Do
   * @returns {object} An object containing condition methods.
   */
  get conditions() {
    return {
      isEquipped: (condition, object, item) => (item.type === SYSTEM.ITEM_TYPE.EQUIPMENT ? item.system.equipped : false),
      isOwned: (condition, object, item) => item.isOwned,
      isLearned: (condition, object, item) => (item.type === SYSTEM.ITEM_TYPE.CAPACITY ? item.system.learned : false),
      isTagged: (condition, object, item) => {
        // Implement the isTagged condition
      },
    }
  }

  /**
   * Evaluates the condition for a given item.
   * @param {object} item The item to evaluate the condition for.
   * @returns {boolean} The result of the condition evaluation.
   * @throws {Error} If the specified predicate is not a valid condition method.
   */
  async evaluate(item) {
    const obj = this.object === "_self" ? item : await fromUuid(item)
    if (!Object.prototype.hasOwnProperty.call(this.conditions, this.predicate)) {
      throw new Error(`Invalid predicate ${this.predicate} for item ${obj.name} with Id ${obj.id}`)
    }

    return this.conditions[this.predicate](this, obj, item)
  }
}
