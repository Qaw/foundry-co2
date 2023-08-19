import { Condition } from "./condition.mjs";

export class Action {

    /**
     * 
     * @param {*} source L'item de type Equipment ou Capacity à l'origine de l'action
     * @param {*} indice numéro de l'action
     * @param {*} type 
     * @param {*} img 
     * @param {*} label 
     * @param {*} chatFlavor 
     * @param {Boolean} visible  Définit si l'action est visible sur la fiche de personnage
     *  Une action sans conditions est visible   
     *  Une action dont toutes les conditions sont vraies est visible
     * @param {Boolean} activable Si true : un bouton permet de l'activer ou de la désactiver
     * @param {Boolean} enabled False tant que la Capacité à l'origine n'est pas activée. Les modifiers ne sont pris en compte que si enabled de l'action vaut true
     * @param {Boolean} temporary true si le sort a une durée
     * Sort permanent : activable et temporary à false, enabled à true
     * Sort à durée : temporary à true et activable à true
     * Sort instantané : temporary à false, et activable à true
     * Attaque simple : temporary à false, et activable à true
     * @param {[]} conditions 
     * @param {[]modifier} modifiers 
     * @param {[]} resolvers 
     */
    constructor(source = null, indice, type, img, label = '', chatFlavor = '', visible = false, activable = false, enabled = false, temporary = false , conditions = [], modifiers = [], resolvers = []) {
        this.source = source;
        this.indice = indice;
        this.type = type;
        this.img = img;
        this.label = label;
        this.chatFlavor = chatFlavor;
        this.properties = {
            "visible": visible,
            "activable": activable,
            "enabled": enabled,
            "temporary": temporary
        }
        this.conditions = conditions;
        this.modifiers = modifiers;
        this.resolvers = resolvers;
    }

    /**
     * Creates an action from a data object.
     */
    static apply(data) {
        Object.assign(this, data);
    }

    /**
     * Creates an empty action.
     */
    static empty() {
        return Action.apply({});
    }

    get hasConditions() {
        return !foundry.utils.isEmpty(this.conditions);
    }

    get hasModifiers() {
        return !foundry.utils.isEmpty(this.modifiers);
    }

    get hasResolvers() {
        return !foundry.utils.isEmpty(this.resolvers);
    }

    /**
     * Update the source of the action and of all the modifiers
     * @param {*} source 
     */
    updateSource(source) {
        this.source = source;

        // Update the source of all modifiers
        Object.values(this.modifiers).forEach(element => {
            element.source = source;
        });
    }

    /**
     * Return true if there is no condition or all conditions are true
     * @param {*} item 
     */
    isVisible(item) {
        if (this.hasConditions) {
            let conditionsArray = this.conditions.map(cond => new Condition(cond.subject, cond.predicate, cond.object));
            return conditionsArray.every(condition => condition.evaluate(item));
        }
        return true;
    }
}

