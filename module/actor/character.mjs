import CoActor from "./actor.mjs";
import {COMBAT, RESOURCES} from "../system/constants.mjs";

export default class CoCharacter extends CoActor {
  prepareDerivedData() {
    super.prepareDerivedData();
    
    this._prepareAbilities();
    this._prepareHPMax();

    for (const [key, skill] of Object.entries(this.system.combat)) {
      // console.debug(skill);
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
      const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;

      if ([COMBAT.MELEE, COMBAT.RANGED, COMBAT.MAGIC].includes(key)) {
        this._prepareAttack(key, skill, abilityBonus, bonuses);
      }

      if (key === COMBAT.INIT) {
        this._prepareInit(skill, bonuses);
      }

      if (key === COMBAT.DEF) {
        this._prepareDef(skill, abilityBonus, bonuses);
      }
    }

    for (const [key, skill] of Object.entries(this.system.resources)) {
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);

      // Points de chance  - Fortune Points - FP
      if (key === RESOURCES.FORTUNE) {
        this._prepareFP(skill, bonuses);
      }

      // Points de mana - Mana Points - MP
      if (key === RESOURCES.MANA) {
        this._prepareMP(skill, bonuses);
      }

      // Points de récupération - Recovery Points - RP
      if (key === RESOURCES.RECOVERY) {
        this._prepareRP(skill, bonuses);
      }
    }
  }
}
