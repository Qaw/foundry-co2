import { Utils } from "../system/utils.mjs";
import { CoAttackCheck } from "../system/roll.mjs";
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

    get resolvers() {
        return {
            "melee" : function(){},
            "ranged" : function(){},
            "heal" : function(){},
            "modifier" : function(){},
        }
    }
    resolve(actor, item, action) {
        if (this.type === "melee") {
            this.melee(actor, item, action);
            return true;
        }
        return false;
    }

    async melee(actor, item, action) {
        const itemName = item.name;
        const actionName = action.label;
        const skillFormula = this.skill.formula[0].part;
        const crit = this.skill.crit;
        const diff = this.skill.diff;
        const damageFormula = this.dmg.formula[0].part;            

        let skillFormulaEvaluated = Utils.evaluate(actor, skillFormula, item.uuid);
        let damageFormulaEvaluated = Utils.evaluate(actor, damageFormula, item.uuid);
        new CoAttackCheck(actor, item).init({itemName, actionName, skillFormulaEvaluated, damageFormulaEvaluated, crit, diff});
    }
}