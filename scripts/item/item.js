
/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class CoItem extends Item {

    /**
     * 
     * @returns true if 
     */
    /**
   * Test if the items has modifiers
   * @type {boolean}
   */
    get hasModifiers() {
        return this.system.modifiers.length > 0;
    }

    /**
     * @description Calculate the sum of all bonus for a specific type and target
     * @param {*} type specie
     * @param {*} target For specie type, target are str, dex, etc...
     * @returns the value of the bonus
     */
    getTotalModifiersByTypeAndTarget(type, target) {
        if (!this.hasModifiers) return 0;
        return this.system.modifiers.filter(m => m.type == type && m.target == target).map(i => i.bonus).reduce((acc, curr) => acc + curr, 0);
    }
}