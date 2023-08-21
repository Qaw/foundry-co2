import {Utils} from "./utils.mjs";
import {CoChat} from "../ui/chat.mjs";
import {CoAttackRollDialog, CoSkillRollDialog} from "../dialogs/dialog-roll.mjs";

class CoRoll {
    constructor(actor) {this.actor = actor;}
    init(args){}
    dialog(label){}
    roll(){}
    chat(){}
}

export class CoSkillCheck extends CoRoll {
    constructor(actor) {
        super(actor);
    }

    init(rolling) {
        return this.dialog(rolling);
    }

    async dialog(rolling) {

        console.log(('rolling : ', rolling));

        const rollingSkill = foundry.utils.getProperty(this.actor, Utils.shortcutResolve(rolling));
        let parts = rolling.replace("@", "").split(".");
        
        const rollingLabel = game.i18n.localize("CO.dialogs.skillCheck") + " - " + game.i18n.localize("CO."+ parts[0] + ".long." + parts[1]);

        const mod = rollingSkill.mod;

        // CoSkillRollDialog
        this.label = rollingLabel;
        this.skill = rollingSkill;
        const dialogData = {
            label: rollingLabel,
            bonus : 0,
            malus : 0,
            mod : mod,
            critrange : 20,
            superior : false,
            weakened : false,
            difficulty : 10,
            showDifficulty : true,
            skillBonuses: this.actor.getSkillBonuses(parts[1]),
            totalSkillBonuses: 0
        };

        let rollDialog = await CoSkillRollDialog.create(this, dialogData);
        rollDialog.render(true);
    }

    roll(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange){
        let r = new CoSkillRoll(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange);
        return r.roll(this.actor);
    }

    async chat(roll){
        await new CoChat(this.actor)
            .withTemplate('systems/co/templates/chat/skillcheck-card.hbs')
            .withData({
                actorId: this.actor.id,
                label: roll._label,
                formula: roll._formula,
                difficulty: roll._difficulty,
                showDifficulty: !!roll._difficulty,
                isCritical: roll._isCritical,
                isFumble: roll._isFumble,
                isSuccess: roll._isSuccess,
                isFailure: !roll._isSuccess,
                total: roll._rollTotal,
                toolTip: roll._toolTip
            })
            .withRoll(roll._roll)
            .create();
    }
}

export class CoDmgRoll extends CoRoll {
    roll(event, actor, rolling) {
        console.debug(game.co.log("DMG ROLL"));
    }
    dialog(){}
    chat(){}
}

export class CoAttackCheck extends CoRoll {
    constructor(actor, item) {
        super(actor);
        this.item = item;
    }

    
    /**
     * @param {Object} rolling {skillFormulaEvaluated, damageFormulaEvaluated, crit, diff}
     * @returns a dialog box
     */
    init(rolling) {
        return this.dialog(rolling);
    }

    async dialog(rolling) {
       
        const rollingLabel = `${rolling.actionName} (${rolling.itemName})`;

        this.label = rollingLabel;

        let dialogData;

        if (!rolling.auto) {
            dialogData = {
                label: rollingLabel,
                critrange : rolling.crit,
                difficulty : rolling.diff,
                showDifficulty : true,
                skillFormula: rolling.skillFormula,
                formulaAttack: rolling.skillFormulaEvaluated,
                damageFormula: rolling.damageFormula,
                formulaDamage: rolling.damageFormulaEvaluated,
                auto: rolling.auto,
                type: rolling.type
            };
        }
        else {
            dialogData = {
                        label: rollingLabel,
                        critrange : '',
                        difficulty : '',
                        showDifficulty : false,
                        formulaAttack: '',
                        formulaDamage: rolling.damageFormulaEvaluated,
                        auto: rolling.auto,
                        type: rolling.type
            };
        }
        
        let rollDialog = await CoAttackRollDialog.create(this, dialogData);
        rollDialog.render(true);
    }

    /**
     * 
     * @param {*} label 
     * @param {*} dice 
     * @param {*} formulaAttack 
     * @param {*} formulaDamage 
     * @param {*} difficulty 
     * @param {*} critrange 
     * @returns 
     */
    rollAttack(label, dice, formulaAttack, formulaDamage, difficulty, critrange){
        let r = new CoAttackRoll(label, dice, formulaAttack, formulaDamage, difficulty, critrange);
        return r.roll(this.actor);
    }

    rollDamage(label, formulaDamage){
        let r = new CoDamageRoll(label, formulaDamage);
        return r.roll(this.actor);
    }

    rollAuto(label, dice, formulaAttack, difficulty, critrange){
        let r = new CoAttackRoll(label, dice, formulaAttack, formulaDamage, difficulty, critrange);
        return r.roll(this.actor);
    }

    async chat(roll, type){
        await new CoChat(this.actor)
            .withTemplate('systems/co/templates/chat/attack-card.hbs')
            .withData({
                typeAttack: type === "attack" ? true : false,
                typeDamage: type === "damage" ? true : false,
                actorId: this.actor.id,
                label: roll._label,
                formula: roll._formula,
                difficulty: roll._difficulty,
                showDifficulty: !!roll._difficulty,
                isCritical: roll._isCritical,
                isFumble: roll._isFumble,
                isSuccess: roll._isSuccess,
                isFailure: !roll._isSuccess,
                total: roll._rollTotal,
                toolTip: roll._toolTip
            })
            .withRoll(roll._roll)
            .create();
    }
}

export class CoSkillRoll {

    constructor(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange){
        this._label = label;
        this._dice = dice;
        this._mod = mod;
        this._bonus = bonus;
        this._malus = malus;
        this._totalSkillBonuses = totalSkillBonuses;
        this._totalBonusMalus = parseInt(this._bonus) + parseInt(this._malus) + parseInt(this._totalSkillBonuses);
        this._total = parseInt(this._mod) + this._totalBonusMalus;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._formula = (this._total === 0) ? this._dice : ((this._totalBonusMalus === 0) ? `${this._dice} ${this._mod}`: `${this._dice} ${this._mod} + ${this._totalBonusMalus}`);
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
        this._roll = null;
        this._toolTip = null;
    }

    /**
     * 
     * @param {*} actor 
     * @returns 
     */
    async roll(actor){
        let r = new Roll(this._formula);
        await r.roll({"async": true});
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._isCritical = ((result >= this._critrange.split("-")[0]) || result == 20);
        this._isFumble = (result == 1);
        if(this._difficulty){
            this._isSuccess = r.total >= this._difficulty;
        }
        this._roll = r;
        this._rollTotal = r._total;
        this._toolTip = new Handlebars.SafeString(await r.getTooltip());
        return this;
    }

    /**
     * @name weaponRoll
     * @description Jet de dommages d'une arme
     *
     * @param {*} actor
     * @param {*} dmgFormula
     * @param {*} dmgDescr
     * @returns
     */
    async weaponRoll(actor, dmgFormula, dmgDescr){
        await this.roll(actor);
        if (this._difficulty) {
            if(this._isSuccess && game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr);
                await r.roll(actor);
                return r;
            }
        }
        else {
            if(game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr);
                await r.roll(actor);
                return r;
            }
        }
    }
}

export class CoAttackRoll {

    constructor(label, dice, formulaAttack, formulaDamage, difficulty, critrange){
        this._label = label;
        this._dice = dice;
        this._formulaAttack = formulaAttack;
        this._formulaDamage = formulaDamage;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._formula = `${this._dice} + ${this._formulaAttack}`;
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
        this._roll = null;
        this._toolTip = null;
    }

    /**
     * 
     * @param {*} actor 
     * @returns 
     */
    async roll(actor){
        let r = new Roll(this._formula);
        await r.roll({"async": true});
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._isCritical = ((result >= this._critrange.split("-")[0]) || result == 20);
        this._isFumble = (result == 1);
        if(this._difficulty){
            this._isSuccess = r.total >= this._difficulty;
        }
        this._roll = r;
        this._rollTotal = r._total;
        this._toolTip = new Handlebars.SafeString(await r.getTooltip());
        return this;
    }

}

export class CoDamageRoll {

    constructor(label, formulaDamage){
        this._label = label;
        this._formula = formulaDamage;
    }

    /**
     * 
     * @param {*} actor 
     * @returns 
     */
    async roll(actor){
        let r = new Roll(this._formula);
        await r.roll({"async": true});
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._roll = r;
        this._rollTotal = r._total;
        this._toolTip = new Handlebars.SafeString(await r.getTooltip());
        return this;
    }

}