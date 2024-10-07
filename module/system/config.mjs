export const CO = {}

// ASCII Artwork
CO.ASCII = `
   ******    *******  
  **////**  **/////**  
 **    //  **     //**      
/**       /**      /** 
/**       /**      /**  
//**    **//**     **       
 //******  //*******        
  //////    ///////   `

CO.itemIcons = {
  equipment: "icons/svg/item-bag.svg",
  capacity: "icons/svg/combat.svg",
  feature: "icons/svg/invisible.svg",
  profile: "icons/svg/upgrade.svg",
  path: "icons/svg/upgrade.svg",
  attack: "icons/svg/sword.svg",
}

CO.actorIcons = {
  character: "icons/svg/mystery-man.svg",
  encounter: "icons/svg/eye.svg",
}

CO.abilities = {
  str: "CO.abilities.long.str",
  dex: "CO.abilities.long.dex",
  con: "CO.abilities.long.con",
  int: "CO.abilities.long.int",
  wis: "CO.abilities.long.wis",
  cha: "CO.abilities.long.cha",
}

CO.spellcasting = {
  modifiers: {
    int: "CO.abilities.long.int",
    wis: "CO.abilities.long.wis",
    cha: "CO.abilities.long.cha",
  },
}

CO.equipment = {
  subtypes: {
    ARMOR: "CO.equipment.subtypes.armor",
    SHIELD: "CO.equipment.subtypes.shield",
    WEAPON: "CO.equipment.subtypes.weapon",
    MISC: "CO.equipment.subtypes.misc",
  },
  martialCategories: {
    MELEE: "CO.equipment.martialCategories.melee",
    RANGED: "CO.equipment.martialCategories.ranged",
    THROWN: "CO.equipment.martialCategories.thrown",
    MAGICAL: "CO.equipment.martialCategories.magical",
  },
  rarity: {
    COMMON: "CO.rarity.common",
    MEDIUM: "CO.rarity.medium",
    RARE: "CO.rarity.rare",
    UNIQUE: "CO.rarity.unique",
  },
}

CO.action = {
  types: {
    spell: "CO.action.types.spell",
    melee: "CO.action.types.melee",
    ranged: "CO.action.types.ranged",
    magical: "CO.action.types.magical",
    heal: "CO.action.types.heal",
    buff: "CO.action.types.buff",
    debuff: "CO.action.types.debuff",
  },
}

CO.condition = {
  objects: {
    item: "CO.condition.objects.item",
    target: "CO.condition.objects.target",
    _self: "CO.condition.objects._self",
  },
  predicates: {
    isLearned: "CO.condition.predicates.isLearned",
    isEquipped: "CO.condition.predicates.isEquipped",
  },
}

CO.resolver = {
  types: {
    melee: "CO.action.types.melee",
    ranged: "CO.action.types.ranged",
    magical: "CO.action.types.magical",
    heal: "CO.action.types.heal",
    buff: "CO.action.types.buff",
    debuff: "CO.action.types.debuff",
  },
}

CO.size = {
  tiny: "CO.size.tiny",
  small: "CO.size.small",
  medium: "CO.size.medium",
  large: "CO.size.large",
  huge: "CO.size.huge",
}

CO.profile = {
  family: {
    enabled: false,
    values: [],
  },
}
