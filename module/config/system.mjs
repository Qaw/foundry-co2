import * as CHARACTER from "./character.mjs";
export const SYSTEM_ID = "co";

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
    ID: SYSTEM_ID,
    ABILITIES: CHARACTER.ABILITIES,
    RESOURCES: CHARACTER.RESOURCES,
    COMBAT: CHARACTER.COMBAT
  };