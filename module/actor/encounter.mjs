import CoActor from "./actor.mjs";

export default class CoEncounter extends CoActor {
    prepareDerivedData() {
        super.prepareDerivedData();

        // for (const [key, ability] of Object.entries(this.system.abilities)) {
        //     console.debug(key, ability);
        //   //   const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr);
        //   //   const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key);
        //   //
        //   //   ability.value = ability.base + bonuses + abilityModifiers.total;
        //   //   ability.tooltip = abilityModifiers.tooltip;
        //   //
        //   //   ability.mod = Stats.getModFromValue(ability.value);
        //   }
        //
        //   for (const [key, combat] of Object.entries(this.system.combat)) {
        //     console.debug(key, combat);
        //     // const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
        //     // const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;
        //
        //     // if (key === COMBAT.INIT) {
        //     //   this._prepareInit(skill, bonuses);
        //     // }
        //     //
        //     // if (key === COMBAT.DEF) {
        //     //   this._prepareDef(skill, abilityBonus, bonuses);
        //     // }
        //   }
        //   for (const [key, attribute] of Object.entries(this.system.attributes)) {
        //     console.debug(key, attribute);
        //     // const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
        //     // const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;
        //
        //     // if (key === COMBAT.INIT) {
        //     //   this._prepareInit(skill, bonuses);
        //     // }
        //     //
        //     // if (key === COMBAT.DEF) {
        //     //   this._prepareDef(skill, abilityBonus, bonuses);
        //     // }
        //   }
        //   // this._prepareHPMax();
    }
}