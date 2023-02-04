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
    constructor(source = null, type, img, label, chatFlavor, activable = false, enabled = false, visible = false, conditions = [], modifiers = [], resolvers = []) {
        this.source = source;
        this.type = type;
        this.img = img;
        this.label = label;
        this.chatFlavor = chatFlavor;
        this.activable = activable;
        this.enabled = enabled;
        this.visible = visible;
        this.conditions = conditions;
        this.modifiers = modifiers;
        this.resolvers = resolvers;
    }

}

