import { SYSTEM } from "../../config/system.mjs"
import RulesEngine from "../../rules-engine.mjs"

/**
 * La class Condition représente un contrôle de condition qui peux être évalué pour un élément donné.
 * predicate ce que l'on veut utiliser pour évaluer la condition
 */
export class Condition extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      predicate: new fields.StringField({ required: true, choices: SYSTEM.CONDITION_PREDICATES, initial: SYSTEM.CONDITION_PREDICATES.isEquipped.id }),
    }
  }

  /**
   * Evaluates the condition for a given item.
   * @param {object} item The item to evaluate the condition for.
   * @returns {boolean} The result of the condition evaluation.
   * @throws {Error} If the specified predicate is not a valid condition method.
   */
  async evaluate(item, actor) {
    console.log("Condition.evaluate", this, item, actor)
    return RulesEngine.evaluate(this.predicate, item, actor) // Utilisation de l'évaluation statique
  }
}
