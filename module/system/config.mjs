export const CO = {};

// ASCII Artwork
CO.ASCII = `
   ******    *******  
  **////**  **/////**  
 **    //  **     //**      
/**       /**      /** 
/**       /**      /**  
//**    **//**     **       
 //******  //*******        
  //////    ///////   `;

CO.itemIcons = {
  "equipment": "icons/svg/item-bag.svg",
  "capacity": "icons/svg/combat.svg",
  "feature": "icons/svg/invisible.svg",
  "profile": "icons/svg/upgrade.svg",
  "path": "icons/svg/upgrade.svg"
}

CO.actorIcons = {
  "character": "icons/svg/mystery-man.svg",
  "encounter": "icons/svg/eye.svg"
}

CO.abilities = {
  str: "CO.abilities.long.str",
  dex: "CO.abilities.long.dex",
  con: "CO.abilities.long.con",
  int: "CO.abilities.long.int",
  wis: "CO.abilities.long.wis",
  cha: "CO.abilities.long.cha"
};

CO.modifier = {
  type: {
    equipment: "CO.modifier.type.equipment",
    feature: "CO.modifier.type.feature",
    profile: "CO.modifier.type.profile",
    capacity: "CO.modifier.type.capacity",
  },
  subtype: {
    ability: "CO.modifier.subtype.ability",
    combat: "CO.modifier.subtype.combat",
    attribute: "CO.modifier.subtype.attribute",
    skill: "CO.modifier.subtype.skill",
  },
  target: {
    str: "CO.abilities.long.str",
    dex: "CO.abilities.long.dex",
    con: "CO.abilities.long.con",
    int: "CO.abilities.long.int",
    wis: "CO.abilities.long.wis",
    cha: "CO.abilities.long.cha",
    melee: "CO.combat.long.melee",
    ranged: "CO.combat.long.ranged",
    magic: "CO.combat.long.magic",
    init: "CO.combat.long.init",
    def: "CO.combat.long.def",
    hp: "CO.label.long.hp",
    rp: "CO.label.long.rp",
  },
};

CO.spellcasting = {
  modifiers: {
    int: "CO.abilities.long.int",
    wis: "CO.abilities.long.wis",
    cha: "CO.abilities.long.cha"
  }
};

CO.equipment = {
  subtypes: {
    ARMOR : "CO.equipment.subtypes.armor",
    SHIELD : "CO.equipment.subtypes.shield",
    WEAPON : "CO.equipment.subtypes.weapon",
    MISC : "CO.equipment.subtypes.misc"
  },
  martialCategories: {
    MELEE: "CO.equipment.martialCategories.melee",
    RANGED: "CO.equipment.martialCategories.ranged",
    THROWN: "CO.equipment.martialCategories.thrown",
    MAGICAL: "CO.equipment.martialCategories.magical"
  },
  rarity: {
    COMMON : "CO.rarity.common",
    MEDIUM : "CO.rarity.medium",
    RARE : "CO.rarity.rare",
    UNIQUE : "CO.rarity.unique"
  }
};

CO.action = {
  types: {
    spell : "CO.actionType.spell",
    melee : "CO.actionType.melee",
    ranged : "CO.actionType.ranged",
    magical : "CO.actionType.magical",
    heal : "CO.actionType.heal",
    protection : "CO.actionType.protection"
  }
};

CO.path = {
  subtypes: {
    PROFILE: "CO.path.subtypes.profile",
    FEATURE: "CO.path.subtypes.feature",
    CREATURE: "CO.path.subtypes.creature",
    PRESTIGE: "CO.path.subtypes.prestige"
  }
};

CO.feature = {
  subtypes: {
    RACE: "CO.feature.subtypes.race",
    TRAIT: "CO.feature.subtypes.trait"
  }
};

CO.size = {
  tiny: "CO.size.tiny",
  small: "CO.size.small",
  medium: "CO.size.medium",
  large: "CO.size.large",
  huge: "CO.size.huge"
};

CO.profile = {
  family: {
    enabled: false,
    values: [],
  },
};

CO.encounter = {
  archetypes : {
    weak : "CO.encounter.archetype.weak",
    quick : "CO.encounter.archetype.quick",
    powerful : "CO.encounter.archetype.powerful",
    standard : "CO.encounter.archetype.standard"
  },
  categories : {
    living: "CO.encounter.category.living",
    humanoid: "CO.encounter.category.humanoid",
    plant: "CO.encounter.category.plant",
    undead : "CO.encounter.category.undead"
  },
  sizes : {
    tiny: "CO.size.tiny",
    small: "CO.size.small",
    medium: "CO.size.medium",
    large: "CO.size.large",
    huge: "CO.size.huge"
  },
  bossRank : {
    noboss: "-",
    boss1: "Boss 1",
    boss2: "Boss 2",
    boss3: "Boss 3",
    boss4: "Boss 4",
    boss5: "Boss 5"
  }
};