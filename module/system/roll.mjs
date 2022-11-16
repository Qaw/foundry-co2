import {Log} from "../utils/log.mjs";
import {Utils} from "./utils.mjs";
import { CoChat } from "../ui/chat.mjs";
class CoRoll {
    init(event, actor, args){}
    dialog(label){}
    roll(){}
    chat(){}
}

export class CoSkillCheck extends CoRoll {
    options() {
        return { classes: ["co", "dialog"] };
    }

    init(event, actor, rolling) {
        return this.dialog(event, actor, rolling);
    }

    dialog(event, actor, rolling) {

        const rollingSkill = eval("actor."+Utils.shortcutResolve(rolling));
        let parts = rolling.replace("@", "").split(".");
        const rollingLabel = game.i18n.localize("CO.dialogs.skillCheck") + " - " + game.i18n.localize("CO."+ parts[0] + ".long." + parts[1]);

        const mod = eval('actor.system.abilities.' + parts[1] + '.mod');

        const dialogTpl = 'systems/co/templates/dialogs/skillcheck-dialog.hbs';
        const tplData = {
            label : rollingLabel,
            actor : actor,
            skill : rollingSkill,
            bonus : 0,
            malus : 0,
            mod : mod,
            critrange : 20,
            superior : false,
            weakened : false,
            difficulty : 10,
            showDifficulty : true
        };

        return renderTemplate(dialogTpl, tplData).then((dialogContent) => {
            return new Dialog(
                {
                    title: rollingLabel,
                    content: dialogContent,
                    buttons: {
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: game.i18n.localize("CO.ui.cancel"),
                            callback: () => {
                            }
                        },
                        submit: {
                            icon: '<i class="fas fa-check"></i>',
                            label: game.i18n.localize("CO.ui.submit"),
                            callback: (html) => {
                                const dice = html.find("#dice").val();
                                const difficulty = html.find('#difficulty').val();
                                const critrange = html.find('input#critrange').val();
                                const mod = html.find('input#mod').val();
                                const bonus = html.find('input#bonus').val();
                                const malus = html.find('input#malus').val();
                                this.roll(actor, rollingLabel, dice, mod, bonus, malus, difficulty, critrange);
                            }
                        }
                    },
                    default: "submit",
                    close: () => {
                    }
                }, this.options()
            ).render(true);
        });
    }

    roll(actor, label, dice, mod, bonus, malus, difficulty, critrange){
        let r = new CoSkillRoll(label, dice, mod, bonus, malus, difficulty, critrange);
        r.roll(actor);
    }

    chat(){
        const rollMessageTpl = 'systems/co/templates/chat/skillcheck-card.hbs';
        const tplData = {
            // label : this._label,
            // difficulty : this._difficulty,
            // showDifficulty : !!this._difficulty,
            // isCritical : this._isCritical,
            // isFumble : this._isFumble,
            // isSuccess : this._isSuccess,
            // isFailure : !this._isSuccess,
            // hasDescription : this._description && this._description.length > 0,
            // description : this._description
        };
        return renderTemplate(rollMessageTpl, tplData);

    }
}

export class CoDmgRoll extends CoRoll {
    roll(event, actor, rolling) {
        Log.debug("DMG ROLL");
    }
    dialog(){}
    chat(){}
}

export class CoAttackRoll extends CoRoll {
    attackRoll(value) {
        Log.debug("ATTACK ROLL")
    }
    dialog(){}
    chat(){}
}

export class CoSkillRoll {

    constructor(label, dice, mod, bonus, malus, difficulty, critrange){
        this._label = label;
        this._dice = dice;
        this._mod = mod;
        this._bonus = bonus;
        this._malus = malus;
        this._totalBonusMalus = parseInt(this._bonus) + parseInt(this._malus);
        this._total = parseInt(this._mod) + this._totalBonusMalus;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._formula = (this._total === 0) ? this._dice : ((this._totalBonusMalus === 0) ? `${this._dice} ${this._mod}`: `${this._dice} ${this._mod} + ${this._totalBonusMalus}`);
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
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

        let chatMessage = await new CoChat(actor)
            .withTemplate('systems/co/templates/chat/skillcheck-card.hbs')
            .withData({
                label : this._label,
                difficulty : this._difficulty,
                showDifficulty : !!this._difficulty,
                isCritical : this._isCritical,
                isFumble : this._isFumble,
                isSuccess : this._isSuccess,
                isFailure : !this._isSuccess
            })
            .withRoll(r)
            .create();

        return r;
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