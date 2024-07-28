import {CO} from "./config.mjs";

export const SYSTEM_NAME = 'co';
export const SYSTEM_DESCRIPTION = "Chroniques Oubliées";

export const MODIFIER_TYPE = {
    EQUIPMENT: "equipment",
    FEATURE: "feature",
    PROFILE: "profile",
    CAPACITY: "capacity"
};

export const MODIFIER_SUBTYPE = {
    ABILITY: "ability",
    COMBAT: "combat",
    ATTRIBUTE: "attribute",
    SKILL: "skill",
    RESOURCE: "resource"
}

export const MODIFIER_TARGET = {
    AGI: "agi",
    CON: "con",
    FOR: "for",
    PER: "per",
    CHA: "cha",
    INT: "int",
    VOL: "vol",
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic',
    INIT: 'init',
    DEF: 'def',
    HP: 'hp',
    RP: 'rp',
    MP: 'mp',
    FP: 'fp'
};

export const COMBAT = {
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic',
    INIT: 'init',
    DEF: 'def'
};

export const RESOURCES = {
    FORTUNE: 'fortune',
    MANA: 'mana',
    RECOVERY: 'recovery',
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary'
}

export const ATTRIBUTE = {
    HP: 'hp'
};

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
    EQUIPMENT: "equipment",
    FEATURE: "feature",
    PROFILE : "profile",    
    PATH: "path",
    CAPACITY: "capacity",
    ATTACK: "attack"
};

export const EQUIPMENT_SUBTYPE = {
    ARMOR: "ARMOR",
    SHIELD: "SHIELD",
    WEAPON: "WEAPON",
    MISC: "MISC"
}

export const ACTOR_TYPE = {
    CHARACTER: "character",
    ENCOUNTER: "encounter",
    VENDOR: "vendor",
    VEHICLE: "vehicle",
    MARKER: "marker"
};

