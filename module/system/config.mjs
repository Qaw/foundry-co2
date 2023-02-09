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

}

CO.profile = {
  family: {
    enabled: false,
    values: [],
  },
};
