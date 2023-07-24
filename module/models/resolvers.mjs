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
            "auto": function(){}
        }
    }
    resolve(actor, item, action, type) {
        if (this.type === "melee") {
            this.melee(actor, item, action, type);
            return true;
        }
        else if (this.type === "auto") {
            this.auto(actor, item, action);
            return true;
        }

        return false;
    }

    async melee(actor, item, action, type) {
        const auto = false;

        const itemName = item.name;
        const actionName = action.label;

        const skillFormula = this.skill.formula[0].part;
        const crit = this.skill.crit;
        const diff = this.skill.diff;              
        const skillFormulaToEvaluate = (skillFormula.includes("d") || skillFormula.includes("D")) ? false : true;
        let skillFormulaEvaluated = skillFormulaToEvaluate ?  Utils.evaluate(actor, skillFormula, item.uuid, true) : Utils.evaluateWithDice(actor, skillFormula, item.uuid, false);

        const damageFormula = this.dmg.formula[0].part;      
        const damageFormulaToEvaluate = (damageFormula.includes("d") || damageFormula.includes("D")) ? false : true;       
        let damageFormulaEvaluated = damageFormulaToEvaluate ? Utils.evaluate(actor, damageFormula, item.uuid, true) : Utils.evaluateWithDice(actor, damageFormula, item.uuid);

        new CoAttackCheck(actor, item).init({auto, type, itemName, actionName, skillFormula, skillFormulaToEvaluate, skillFormulaEvaluated, damageFormula, damageFormulaToEvaluate, damageFormulaEvaluated, crit, diff});
    }

    async auto(actor, item, action) {
        const itemName = item.name;
        const actionName = action.label;
        const damageFormula = this.dmg.formula[0].part;
        const auto = true;     
        const type = "damage"       ;

        let damageFormulaEvaluated = damageFormula.includes("d") || damageFormula.includes("D") ?  Utils.evaluateWithDice(actor, damageFormula, item.uuid) : Utils.evaluate(actor, damageFormula, item.uuid);
        new CoAttackCheck(actor, item).init({auto, type, itemName, actionName, damageFormulaEvaluated});
    }
}