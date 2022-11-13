/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class CoItem extends Item {
  /** @override */
  prepareBaseData() {
    this.system.slug = this.name.slugify({ strict: true });
    // switch (this.type) {
    //   case ITEM_TYPE.PATH:
    //     return this._preparePathData();
    // }
  }

  /**
   *
   */
  // _preparePathData() {
  //   this.system.maxRank = PATH_MAX_RANK;
  // }

  // /**
  //  * @returns undefined if the item is not a specie, true if the item has modifiers
  //  * @type {boolean}
  //  */
  // get hasModifiers() {
  //   if (!this.type == ITEM_TYPE.SPECIE) return undefined;
  //   return this.system.modifiers?.length > 0;
  // }

  // /**
  //  * @returns undefined if the tiem is not a specie or a path, null if there is no capacities already, all the capacities
  //  * @type {boolean}
  //  */
  // get allCapacities() {
  //   if (!this.type == ITEM_TYPE.SPECIE && !this.type == ITEM_TYPE.PATH) return undefined;
  //   // No capacities
  //   if (this.system.capacities === undefined) return null;
  //   return this.system.capacities;
  // }

  // /**
  //  * @description Calculate the sum of all bonus for a specific type and target
  //  * @param {*} type specie
  //  * @param {*} target For specie type, target are str, dex, etc...
  //  * @returns the value of the bonus
  //  */
  // getTotalModifiersByTypeAndTarget(type, target) {
  //   if (!this.type == ITEM_TYPE.SPECIE) return undefined;
  //   if (!this.hasModifiers) return 0;
  //   return this.system.modifiers
  //     .filter((m) => m.type == type && m.target == target)
  //     .map((i) => i.bonus)
  //     .reduce((acc, curr) => acc + curr, 0);
  // }

  // /**
  //  *
  //  * @param {*} source
  //  * @returns true if the capacity with a same source already exists
  //  * @type {boolean}
  //  */
  // hasCapacityBySource(source) {
  //   if (this.allCapacities != null && this.allCapacities.find((capacity) => capacity.source == source)) return true;
  //   return false;
  // }
}
