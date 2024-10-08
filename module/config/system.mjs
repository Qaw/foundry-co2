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
export const ATTACK_TYPES = { MELEE: "CO.combat.long.melee", RANGED: "CO.combat.long.ranged", MAGICAL: "CO.combat.long.magic" }
export const ACTOR_TYPES = { CHARACTER: "character", ENCOUNTER: "encounter" }

export const MAGIC_ATTACK_TYPE = { INT: "int", VOL: "vol", CHA: "cha" }

export const PATH_TYPE = { PROFILE: "profile", SPECIE: "specie", CULTURAL: "cultural", PRESTIGE: "prestige", ENCOUNTER: "encounter" }

export const PATH_MAX_RANK = 5

export const EQUIPMENT_SUBTYPE = { ARMOR: "ARMOR", SHIELD: "SHIELD", WEAPON: "WEAPON", MISC: "MISC" }

export const COMBAT_TYPE = { MELEE: "melee", RANGED: "ranged", MAGIC: "magic", INIT: "init", DEF: "def" }

export const RESOURCES_TYPE = { FORTUNE: "fortune", MANA: "mana", RECOVERY: "recovery", PRIMARY: "primary", SECONDARY: "secondary", TERTIARY: "tertiary" }

export const ATTRIBUTE = { HP: "hp" }

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

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  ID: SYSTEM_ID,
  SYSTEM_DESCRIPTION,
  ASCII,
  ITEM_ICONS,
  ACTOR_ICONS,
  ATM_ABILITY,
  DICES,
  RECOVERY_DICES,
  PROFILE_FAMILY,
  PV,
  ABILITIES: CHARACTER.ABILITIES,
  RESOURCES: CHARACTER.RESOURCES,
  COMBAT: CHARACTER.COMBAT,
  MOVEMENT_UNIT,
  SIZES,
  ATTACK_TYPES,
  ENCOUNTER_ARCHETYPES: ENCOUNTER.ARCHETYPES,
  ENCOUNTER_CATEGORIES: ENCOUNTER.CATEGORIES,
  ENCOUNTER_BOSS_RANKS: ENCOUNTER.BOSS_RANKS,
  MODIFIER_TYPE,
  MODIFIER_SUBTYPE,
  MODIFIER_TARGET,
  ACTOR_TYPES,
  ITEM_TYPE: ITEM.ITEM_TYPE,
  EQUIPMENT_SUBTYPE,
  COMBAT_TYPE,
  RESOURCES_TYPE,
  ATTRIBUTE,
  FEATURE_SUBTYPE: FEATURE.FEATURE_SUBTYPE,
  MODIFIERS,
  PATH_SUBTYPE: PATH.PATH_SUBTYPE,
  ACTION_TYPES: ACTION.ACTION_TYPES,
  CONDITION_OBJECTS: ACTION.CONDITION_OBJECTS,
  CONDITION_PREDICATES: ACTION.CONDITION_PREDICATES,
  RESOLVER_TYPES: ACTION.RESOLVER_TYPES,
}
