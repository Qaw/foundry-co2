import { Characteristic } from "../common/utils.js";
import { MODIFIER_TYPE } from "../common/constants.js";

/**
 * Extend the base Actor entity
 * @extends {Actor}
 */
export default class CoActor extends Actor {
  //#region Data preparation
  /** @override */
  prepareBaseData() {
    switch (this.type) {
      case "character":
        return this._prepareCharacterData();
    }
  }

  prepareDerivedData() {
    switch (this.type) {
      case "character":
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
      characteristic.value = characteristic.base + characteristic.specie + characteristic.bonus;
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

  //#endregion
}
