import CoActor from "./actor.mjs"
import { Action } from "../models/action/action.mjs"
import { SYSTEM } from "../config/system.mjs"

export default class CoEncounter extends CoActor {
  prepareDerivedData() {
    super.prepareDerivedData()

    this._prepareAbilities()
    console.debug(this)

    this._prepareHPMax()

    for (const [key, skill] of Object.entries(this.system.combat)) {
      console.debug(skill)
      // Somme du bonus de la feuille et du bonus des effets
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr)
      // Const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;

      if (key === SYSTEM.COMBAT.INIT) {
        // This._prepareInit(skill, bonuses);
        skill.value = skill.base + bonuses
      }

      if (key === SYSTEM.COMBAT.DEF) {
        // This._prepareDef(skill, abilityBonus, bonuses);
        skill.value = skill.base + bonuses
      }
    }
  }

  // #region accesseurs

  /**
   * Toutes les actions visibles des capacités
   * Retrieves all visible actions from items of type SYSTEM.ITEM_TYPE.CAPACITY.
   *
   * @returns {Array} An array of visible actions from the items.
   */
  get visibleActions() {
    let allActions = []
    this.items.forEach((item) => {
      if ([SYSTEM.ITEM_TYPE.CAPACITY].includes(item.type) && item.actions.length > 0) {
        allActions.push(...item.visibleActions)
      }
    })
    return allActions
  }

  get attacks() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.ATTACK)
  }

  /**
   * Retourne toutes les actions visibles des attaques
   */
  get attacksActions() {
    let allActions = []
    this.items.forEach((item) => {
      if ([SYSTEM.ITEM_TYPE.ATTACK].includes(item.type) && item.actions.length > 0) {
        allActions.push(...item.visibleActions)
      }
    })
    return allActions
  }

  // #endregion

  /**
   * Add an attack as an embedded item
   * @param {CoItem} attack
   * @returns {number} id of the created capacity
   */
  async addAttack(attack) {
    let attackData = attack.toObject()
    attackData.system.learned = true
    attackData = attackData instanceof Array ? attackData : [attackData]
    const newAttack = await this.createEmbeddedDocuments("Item", attackData)
    // Update the source of all actions with the id of the new embedded capacity created
    let newActions = Object.values(foundry.utils.deepClone(newAttack[0].system.actions)).map((m) => {
      const action = new Action(
        m.source,
        m.indice,
        m.type,
        m.img,
        m.label,
        m.chatFlavor,
        m.properties.visible,
        m.properties.activable,
        m.properties.enabled,
        m.properties.temporary,
        m.conditions,
        m.modifiers,
        m.resolvers,
      )
      // Update the source and source's modifiers for the action
      action.updateSource(newAttack[0].id)
      return action
    })

    const updateActions = { _id: newAttack[0].id, "system.actions": newActions }
    await this.updateEmbeddedDocuments("Item", [updateActions])

    return newAttack[0].id
  }
}
