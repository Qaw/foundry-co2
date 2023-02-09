export class Action {

    /**
     * 
     * @param {*} source 
     * @param {*} type 
     * @param {*} img 
     * @param {*} label 
     * @param {*} chatFlavor 
     * @param {*} activable 
     * @param {*} enabled 
     * @param {*} visible 
     * @param {*} conditions 
     * @param {*} modifiers 
     * @param {*} resolvers 
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

