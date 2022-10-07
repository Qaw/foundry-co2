import { Characteristic } from "../common/utils.js";
import { MODIFIER_TYPE, ACTOR_TYPE, ITEM_TYPE } from "../common/constants.js";

/**
 * Extend the base Actor entity
 * @extends {Actor}
 */
export default class CoActor extends Actor {
  //#region Data preparation
  /** @override */
  prepareBaseData() {
    switch (this.type) {
      case ACTOR_TYPE.CHARACTER:
        return this._prepareCharacterData();
    }
  }

  prepareDerivedData() {
    switch (this.type) {
      case ACTOR_TYPE.CHARACTER:
        return this._prepareCharacterDerivedData();
    }
  }

  /**
   * Perform any Character specific preparation.
   * @protected
   */
  _prepareCharacterData() {
    for (const [key, characteristic] of Object.entries(this.system.characteristics)) {
      characteristic.specie = (this.specie === undefined ? 0 : this.specie.getTotalModifiersByTypeAndTarget(MODIFIER_TYPE.SPECIE, key));
    }
  }

  /** @override */
  _prepareCharacterDerivedData() {
    for (const [key, characteristic] of Object.entries(this.system.characteristics)) {
      characteristic.value = characteristic.base + characteristic.specie + characteristic.bonus + characteristic.otherBonus;
      characteristic.mod = Characteristic.getModFromValue(characteristic.value);
    }
  }

  //#endregion

  //#region Accessors
  /**
   * @returns undefined if no items or no items of specie type
   */
  get specie() {
    if (this.items.size == 0) return undefined;
    return this.items.find(i => i.type === MODIFIER_TYPE.SPECIE);
  }

  get paths() {
    if (this.items.size == 0) return undefined;
    return this.items.filter(item => item.type == ITEM_TYPE.PATH);
  }

  get capacities() {
    if (this.items.size == 0) return undefined;
    return this.items.filter(item => item.type == ITEM_TYPE.CAPACITY);
  }

  getEmbeddedItemByKey(key) {
    return this.items.find(item => item.system.key == key);
  }

  //#endregion

  toggleCapacity(pathId, capacityKey, status) {
    const path = this.items.get(pathId);
    let capacities = duplicate(path.system.capacities);

    let capacity = capacities.find((capacity) => capacity.key == capacityKey);
    capacity.selected = status;

    const updateData = [{ _id: pathId, "system.capacities": capacities }];

    // Add capacity
    if (status) {
      this._addCapacity(capacity.source);
    }
    // Remove capacity
    else {
      this._removeCapacity(capacityKey);
    }

    this.updateEmbeddedDocuments("Item", updateData);
  }

  async _addCapacity(capacitySource) {
    let document = await fromUuid(capacitySource);
    return this.createEmbeddedDocuments("Item", [document]);

  }

  _removeCapacity(capacityKey) {
    const capacity = this.capacities.find(capacity => capacity.system.key == capacityKey);
    if (!capacity) return;
    let capacityId = capacity._id;
    this.deleteEmbeddedDocuments("Item", [capacityId]);
  }

  deleteItem(itemId) {
    const item = this.items.find(item => item.id === itemId);
      
    switch (item.type) {
      case ITEM_TYPE.PATH:
        {
          // Path
          let itemsToDelete = [];
          itemsToDelete.push (item.id);

          // Capacities
          item.system.capacities.map( c =>  { 
                const item = this.getEmbeddedItemByKey(c.key);
                if (item) itemsToDelete.push(item.id);
          });      
          return this.deleteEmbeddedDocuments("Item", itemsToDelete);   
        }
      case ITEM_TYPE.CAPACITY:
        {
          // Check if the capacity was selected in a path          
          this.paths.forEach(path => {
            let capacities = duplicate(path.system.capacities);
            let capacity = capacities.find((capacity) => capacity.key == item.system.key);
            if (capacity)  {
              capacity.selected = false;     
              const updateData = [{ _id: path.id, "system.capacities": capacities }];
              this.updateEmbeddedDocuments("Item", updateData);
            }
          });
          return this.deleteEmbeddedDocuments("Item", [itemId]);
        }


        
    }
  }

}
