export const EQUIPMENT_SUBTYPES = {
  armor: {
    id: "armor",
    label: "CO.equipment.subtypes.armor",
  },
  shield: {
    id: "shield",
    label: "CO.equipment.subtypes.shield",
  },
  weapon: {
    id: "weapon",
    label: "CO.equipment.subtypes.weapon",
  },
  consumable: {
    id: "consumable",
    label: "CO.equipment.subtypes.consumable",
  },
  misc: {
    id: "misc",
    label: "CO.equipment.subtypes.misc",
  },
}

// Livre de Règles, Page 193
export const EQUIPMENT_RARITY = {
  common: {
    id: "common",
    label: "CO.rarity.common",
  },
  precious: {
    id: "precious",
    label: "CO.rarity.precious",
  },
  exotic: {
    id: "exotic",
    label: "CO.rarity.exotic",
  },
  rare: {
    id: "rare",
    label: "CO.rarity.rare",
  },
  veryRare: {
    id: "veryRare",
    label: "CO.rarity.veryRare",
  },
  unique: {
    id: "unique",
    label: "CO.rarity.unique",
  },
}

export const EQUIPMENT_DAMAGETYPE = {
  slashing: {
    id: "slashing",
    label: "CO.damage.slashing",
  },
  impact: {
    id: "bludgeoning",
    label: "CO.damage.bludgeoning",
  },
  piercing: {
    id: "piercing",
    label: "CO.damage.piercing",
  },
  magic: {
    id: "magic",
    label: "CO.damage.magic",
  },
}

export const EQUIPMENT_CURRENCIES = {
  gp: {
    id: "gp",
    label: "CO.currency.gp",
  },
  sp: {
    id: "sp",
    label: "CO.currency.sp",
  },
  cp: {
    id: "cp",
    label: "CO.currency.cp",
  },
}

export const EQUIPMENT_TAGS = {
  dmtemporaires: {
    id: "dmtemporaires",
    label: "CO.equipment.tags.dmtemporaires",
  },
  dmtemporairespossibles: {
    id: "dmtemporairespossibles",
    label: "CO.equipment.tags.dmtemporairespossibles",
  },
  legere: {
    id: "legere",
    label: "CO.equipment.tags.legere",
  },
}

// Pour permettre de les remplacer dans un autre module éventuellement
// Il s'agit des items de base à donner à la création d'un joueur/encounter
export const BASE_ITEM_UUID = {
  hands: "Compendium.cof-base.cof-2-base-items.Item.bwUmODTqsTqPbRr9",
  support: "Compendium.cof-base.cof-2-base-items.Item.0PawJrcH7daQ8RoJ",
}
