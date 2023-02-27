import { ITEM_TYPE } from "./constants.mjs";

export class Condition {

    /**
     * 
     * @param {*} subject 
     * @param {*} predicate 
     * @param {*} object 
     */
    constructor(subject, predicate, object) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
    }

    evaluate(item) {
        if (this.subject == "item" && this.predicate == "equipped" && this.object == "_self") {
            if (item.type === ITEM_TYPE.EQUIPMENT) return item.system.equipped;
            if (item.type === ITEM_TYPE.CAPACITY) return item.system.learned;
        }
    }
}