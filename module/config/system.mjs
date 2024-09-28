import * as CHARACTER from "./character.mjs"
import * as ENCOUNTER from "./encounter.mjs"

export const SYSTEM_ID = "co"
export const MOVEMENT_UNIT = { m: "CO.label.long.meters", ft: "CO.label.long.feet" }
export const SIZES = { tiny: "CO.size.tiny", small: "CO.size.small", medium: "CO.size.medium", large: "CO.size.large", huge: "CO.size.huge" }
export const ATTACK_TYPES = { MELEE: "CO.combat.long.melee", RANGED: "CO.combat.long.ranged", MAGICAL: "CO.combat.long.magic" }

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
  SIZES,
  ATTACK_TYPES,
  ENCOUNTER_ARCHETYPES: ENCOUNTER.ARCHETYPES,
  ENCOUNTER_CATEGORIES: ENCOUNTER.CATEGORIES,
  ENCOUNTER_BOSS_RANKS: ENCOUNTER.BOSS_RANKS,
}
