import * as ACTION from "./action.mjs"
import * as CHARACTER from "./character.mjs"
import * as ENCOUNTER from "./encounter.mjs"
import * as FEATURE from "./feature.mjs"
import * as ITEM from "./item.mjs"
import * as MODIFIERS from "./modifier.mjs"
import * as PATH from "./path.mjs"

import { MODIFIER_TYPE, MODIFIER_SUBTYPE, MODIFIER_TARGET } from "./constants.mjs"

export const ASCII = `
   ******    *******  
  **////**  **/////**  
 **    //  **     //**      
/**       /**      /** 
/**       /**      /**  
//**    **//**     **       
 //******  //*******        
  //////    ///////   `

export const SYSTEM_ID = "co"
export const SYSTEM_DESCRIPTION = "Chroniques Oubliées"
export const MOVEMENT_UNIT = { m: "CO.label.long.meters", ft: "CO.label.long.feet" }
export const SIZES = { tiny: "CO.size.tiny", small: "CO.size.small", medium: "CO.size.medium", large: "CO.size.large", huge: "CO.size.huge" }

export const ITEM_ICONS = {
  equipment: "icons/svg/item-bag.svg",
  capacity: "icons/svg/combat.svg",
  feature: "icons/svg/invisible.svg",
  profile: "icons/svg/upgrade.svg",
  path: "icons/svg/upgrade.svg",
  attack: "icons/svg/sword.svg",
}

export const ACTOR_ICONS = { character: "icons/svg/mystery-man.svg", encounter: "icons/svg/eye.svg" }

export const ATM_ABILITY = { int: "CO.abilities.long.int", vol: "CO.abilities.long.vol", cha: "CO.abilities.long.cha" }

export const DICES = { d4: "d4", d6: "d6", d8: "d8", d10: "d10", d12: "d12", d20: "d20" }
export const RECOVERY_DICES = { d6: "d6", d8: "d8", d10: "d10" }

export const PROFILE_FAMILY = {
  aventurier: "CO.profile.family.aventurier",
  combattant: "CO.profile.family.combattant",
  mage: "CO.profile.family.mage",
  mystique: "CO.profile.family.mystique",
}

export const PV = { 3: "3", 4: "4", 5: "5" }

// Constantes used inside the system to check for specific values
export const ATTACK_TYPE = { MELEE: "CO.combat.long.melee", RANGED: "CO.combat.long.ranged", MAGICAL: "CO.combat.long.magic" }
export const ACTOR_TYPE = { CHARACTER: "character", ENCOUNTER: "encounter" }
export const MAGIC_ATTACK_TYPE = { INT: "int", VOL: "vol", CHA: "cha" }
export const PATH_TYPE = { PROFILE: "profile", SPECIE: "specie", CULTURAL: "cultural", PRESTIGE: "prestige", ENCOUNTER: "encounter" }
export const EQUIPMENT_SUBTYPE = { ARMOR: "armor", SHIELD: "shield", WEAPON: "weapon", MISC: "misc" }
export const ATTRIBUTE = { HP: "hp" }

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  ID: SYSTEM_ID,
  SYSTEM_DESCRIPTION,
  ASCII,
  ABILITIES: CHARACTER.ABILITIES,
  ACTION_TYPES: ACTION.ACTION_TYPES,
  ACTOR_TYPE: ACTOR_TYPE,
  ACTOR_ICONS,
  ATTRIBUTE,
  ATTACK_TYPE: ATTACK_TYPE,
  ATM_ABILITY,
  COMBAT: CHARACTER.COMBAT,
  COMBAT_TYPE: CHARACTER.COMBAT_TYPE,
  CONDITION_OBJECTS: ACTION.CONDITION_OBJECTS,
  CONDITION_PREDICATES: ACTION.CONDITION_PREDICATES,
  DICES,
  ENCOUNTER_ARCHETYPES: ENCOUNTER.ARCHETYPES,
  ENCOUNTER_CATEGORIES: ENCOUNTER.CATEGORIES,
  ENCOUNTER_BOSS_RANKS: ENCOUNTER.BOSS_RANKS,
  EQUIPMENT_SUBTYPE,
  FEATURE_SUBTYPE: FEATURE.FEATURE_SUBTYPE,
  ITEM_ICONS,
  ITEM_TYPE: ITEM.ITEM_TYPE,
  MODIFIER_TYPE,
  MODIFIER_SUBTYPE,
  MODIFIER_TARGET,
  PATH_SUBTYPE: PATH.PATH_SUBTYPE,
  PV,
  RECOVERY_DICES,
  PROFILE_FAMILY,
  MODIFIERS,
  MOVEMENT_UNIT,
  RESOLVER_TYPE: ACTION.RESOLVER_TYPE,
  RESOURCES: CHARACTER.RESOURCES,
  RESOURCES_TYPE: CHARACTER.RESOURCES_TYPE,
  SIZES,
}
