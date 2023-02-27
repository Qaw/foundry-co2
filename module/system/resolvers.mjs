import { Utils } from "../system/utils.mjs";
import { CoAttackRoll } from "../system/roll.mjs";
export class Resolver {

    /**
     * 
     * @param {*} type 
     * @param {*} skill 
     * @param {*} dmg 
     */
    constructor(type, skill, dmg) {
        this.type = type;
        this.skill = skill;
        this.dmg = dmg;
    }

    resolve(actor, item) {
        if (this.type === "melee") {
            this.melee(actor, item);
            return true;
        }
        return false;
    }

    async melee(actor,item) {
        const skillFormula = this.skill.formula[0].part;
        const crit = this.skill.crit;
        const damageFormula = this.dmg.formula[0].part;            

        let skillFormulaEvaluated = Utils.evaluate(actor, skillFormula, item.uuid);
        let damageFormulaEvaluated = Utils.evaluate(actor, damageFormula, item.uuid);
        await new CoAttackRoll(this).attackRoll(skillFormulaEvaluated, damageFormulaEvaluated);		
    }
}