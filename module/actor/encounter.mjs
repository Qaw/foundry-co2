import CoActor from "./actor.mjs";
import { COMBAT, ITEM_TYPE } from "../system/constants.mjs";
import { Action } from "../models/action/action.mjs";

export default class CoEncounter extends CoActor {
  prepareDerivedData() {
    super.prepareDerivedData();
    console.debug(this);

    this._prepareHPMax();

    for (const [key, skill] of Object.entries(this.system.combat)) {
      console.debug(skill);
      // Somme du bonus de la feuille et du bonus des effets
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
      // const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;

      if (key === COMBAT.INIT) {
        // this._prepareInit(skill, bonuses);
        skill.value = skill.base + bonuses;
      }

      if (key === COMBAT.DEF) {
        // this._prepareDef(skill, abilityBonus, bonuses);
        skill.value = skill.base + bonuses;
      }
    }
  }

  //#region accesseurs

    /**
     * @returns Toutes les actions visibles des capacités
     */
    get visibleActions() {
        let allActions = [];
        this.items.forEach((item) => {
            if ([ITEM_TYPE.CAPACITY].includes(item.type) && item.actions.length > 0) {
            allActions.push(...item.visibleActions);
            }
        });
        return allActions;
        }

    get attacks() {
        return this.items.filter((item) => item.type === ITEM_TYPE.ATTACK);
    }
    
    /**
     * @returns Toutes les actions visibles des attaques
     */
    get attacksActions() {
        let allActions = [];
        this.items.forEach((item) => {
            if ([ITEM_TYPE.ATTACK].includes(item.type) && item.actions.length > 0) {
            allActions.push(...item.visibleActions);
            }
        });
        return allActions;
    }

    //#endregion

  /**
   * @description Add an attack as an embedded item
   * @param {CoItem} attack
   * @returns {Number} id of the created capacity
   */
  async addAttack(attack) {
    let attackData = attack.toObject();
    attackData.system.learned = true;
    attackData = attackData instanceof Array ? attackData : [attackData];
    const newAttack = await this.createEmbeddedDocuments("Item", attackData);
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
        m.resolvers
      );
      // Update the source and source's modifiers for the action
      action.updateSource(newAttack[0].id);
      return action;
    });

    const updateActions = { _id: newAttack[0].id, "system.actions": newActions };
    await this.updateEmbeddedDocuments("Item", [updateActions]);

    return newAttack[0].id;
  }
  
}
