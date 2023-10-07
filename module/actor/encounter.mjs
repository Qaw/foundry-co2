import CoActor from "./actor.mjs";
import {COMBAT} from "../system/constants.mjs";

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
}