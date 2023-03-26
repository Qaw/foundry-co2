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

    get conditions() {
        return {
            "isEquiped" : function(condition, object, item) { return (item.type === ITEM_TYPE.EQUIPMENT) ? item.system.equipped : false },
            "isOwned" : function(condition, object, item) {},
            "isLearned" : function(condition, object, item) { return (item.type === ITEM_TYPE.CAPACITY) ? item.system.learned : false },
            "isTagged" : function(condition, object, item) {}
        }
    }
    evaluate(item) {
        const obj = (this.object === "_self") ? item : fromUuid(item);
        return (Object.keys(this.conditions).includes(this.predicate)) ? this.conditions[this.predicate](this, obj, item) : false;
    }
}