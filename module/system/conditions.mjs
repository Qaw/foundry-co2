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
}