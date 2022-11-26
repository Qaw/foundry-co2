import {CO} from "./config.mjs";

export const SYSTEM_NAME = 'co';
export const SYSTEM_DESCRIPTION = "Chroniques Oubliées";

export const MODIFIER_TYPE = {
    TRAIT: "trait",
    PROFILE: "profile",
    CAPACITY: "capacity"
};

export const MODIFIER_SUBTYPE = {
    ABILITY: "ability",
    COMBAT: "combat",
    ATTRIBUTE: "attribute"
}

export const MODIFIER_TARGET = {
    STR: "str",
    DEX: "dex",
    CON: "con",
    INT: "int",
    WIS: "wis",
    CHA: "cha",
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic',
    INIT: 'init',
    DEF: 'def'
};

export const COMBAT = {
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic',
    INIT: 'init',
    DEF: 'def'
}

export const MAGIC_ATTACK_TYPE = {
    INT: "int",
    WIS: "wis",
    CHA: "cha"
};

export const PATH_TYPE = {
    PROFILE: "profile",
    SPECIE: "specie",
    CULTURAL: "cultural",
    PRESTIGE: "prestige",
    ENCOUNTER: "encounter"
};

export const PATH_MAX_RANK = 5;

export const ITEM_TYPE = {
    ITEM : "item",
    EQUIPMENT: "equipment",
    PROFILE : "profile",
    CONSUMABLE : "consumable",
    LOOT : "loot",
    CURRENCY : "currency",
    ACTION : "action",
    TRAIT: "trait",
    FEATURE: "feature",
    PATH: "path",
    CAPACITY: "capacity"
};

export const ACTOR_TYPE = {
    CHARACTER: "character",
    ENCOUNTER: "encounter",
    VENDOR: "vendor",
    VEHICLE: "vehicle",
    MARKER: "marker"
};

export const OPEN_TYPE = {
    SOURCE: "source",
    EMBEDDED_ID: "embeddedId"
};
