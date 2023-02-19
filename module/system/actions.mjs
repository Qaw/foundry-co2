export class Action {

    /**
     * 
     * @param {*} source L'item de type Equipment ou Capacity à l'origine de l'action
     * @param {*} type 
     * @param {*} img 
     * @param {*} label 
     * @param {*} chatFlavor 
     * @param {Boolean} visible  Définit si l'action est visible sur la fiche de personnage
     *  Pour une action venant d'une capacité, si le champ Enabled de la capacité est à True, alors l'action est visible   
     *  Pour une action venant d'un équipement, si le champ Enabled de l'équipement est à True, alors l'action est visible   
     * @param {Boolean} activable Si true : un bouton permet de l'activer ou de la désactiver
     * @param {Boolean} enabled False tant que la Capacité à l'origine n'est pas activée. Les modifiers ne sont pris en compte que si enabled de l'action vaut true
     * @param {Boolean} temporary true si le sort a une durée
     * Sort permanent : activable et temporary à false, enabled à true
     * Sort à durée : temporary à true et activable à true
     * Sort instantané : temporary à false, et activable à true
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

    get hasConditions() {
        return !foundry.utils.isEmpty(this.conditions);
    }

    get hasModifiers() {
        return !foundry.utils.isEmpty(this.modifiers);
    }

    get hasResolvers() {
        return !foundry.utils.isEmpty(this.resolvers);
    }

    updateSource(source) {
        this.source = source;

        // Update the source of all modifiers
        Object.values(this.modifiers).forEach(element => {
            element.source = source;
        });
    }

}

