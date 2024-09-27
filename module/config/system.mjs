import * as CHARACTER from "./character.mjs"

export const SYSTEM_ID = "co"
export const MOVEMENT_UNIT = { m: "CO.label.long.meters", ft: "CO.label.long.feet" }
export const SIZE = { tiny: "CO.size.tiny", small: "CO.size.small", medium: "CO.size.medium", large: "CO.size.large", huge: "CO.size.huge" }

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  ID: SYSTEM_ID,
  ABILITIES: CHARACTER.ABILITIES,
  RESOURCES: CHARACTER.RESOURCES,
  COMBAT: CHARACTER.COMBAT,
  MOVEMENT_UNIT,
  SIZE,
}
