export const ACTION_TYPES = Object.freeze({
  spell: {
    id: "spell",
    label: "CO.action.types.spell",
  },
  melee: {
    id: "melee",
    label: "CO.action.types.melee",
  },
  ranged: {
    id: "ranged",
    label: "CO.action.types.ranged",
  },
  magical: {
    id: "magical",
    label: "CO.action.types.magical",
  },
  heal: {
    id: "heal",
    label: "CO.action.types.heal",
  },
  buff: {
    id: "buff",
    label: "CO.action.types.buff",
  },
  debuff: {
    id: "debuff",
    label: "CO.action.types.debuff",
  },
})

export const CONDITION_OBJECTS = Object.freeze({
  item: {
    id: "item",
    label: "CO.condition.objects.item",
  },
  target: {
    id: "target",
    label: "CO.condition.objects.target",
  },
  _self: {
    id: "_self",
    label: "CO.condition.objects._self",
  },
  testResult: {
    id: "testResult",
    label: "CO.condition.objects.testresult",
  },
  testType: {
    id: "testType",
    label: "CO.condition.objects.testtype",
  },
  nc: {
    id: "nc",
    label: "CO.condition.objects.nc",
  },
  hp: {
    id: "hp",
    label: "CO.condition.objects.hp",
  },
  equippedArmor: {
    id: "equippedArmor",
    label: "CO.condition.objects.equippedArmor",
  },
  equipedWeapon: {
    id: "equipedWeapon",
    label: "CO.condition.objects.equipedWeapon",
  },
})

export const CONDITION_PREDICATES = Object.freeze({
  isLearned: {
    id: "isLearned",
    label: "CO.condition.predicates.isLearned",
  },
  isEquipped: {
    id: "isEquipped",
    label: "CO.condition.predicates.isEquipped",
  },
  isEqualTo: {
    id: "isEqualTo",
    label: "CO.condition.predicates.isEqualTo",
  },
  isLowerOrEqualThan: {
    id: "isLowerOrEqualThan",
    label: "CO.condition.predicates.isLowerOrEqualThan",
  },
  isHigherOrEqualThan: {
    id: "isHigherOrEqualThan",
    label: "CO.condition.predicates.isHigherOrEqualThan",
  },
  isAbilityType: {
    id: "isAbilityType",
    label: "CO.condition.predicates.isAbilityType",
  },
})

export const CONDITION_TARGETS = Object.freeze({
  item: {
    id: "item",
    label: "CO.condition.targets.item",
  },
  target: {
    id: "target",
    label: "CO.condition.targets.target",
  },
  _self: {
    id: "_self",
    label: "CO.condition.targets._self",
  },
  isSuccess: {
    id: "isSuccess",
    label: "CO.condition.targets.isSuccess",
  },
  isFailure: {
    id: "isFailure",
    label: "CO.condition.targets.isFailure",
  },
  isCritical: {
    id: "isAbilityType",
    label: "CO.condition.targets.isCritical",
  },
  formula: {
    id: "formula",
    label: "CO.condition.targets.formula",
  },
  melee: {
    id: "isAbilityType",
    label: "CO.condition.targets.melee",
  },
  ranged: {
    id: "isAbilityType",
    label: "CO.condition.targets.ranged",
  },
  magic: {
    id: "isAbilityType",
    label: "CO.condition.targets.magic",
  },
  noArmor: {
    id: "isAbilityType",
    label: "CO.condition.targets.noArmor",
  },
})

export const RESOLVER_TYPE = Object.freeze({
  melee: {
    id: "melee",
    label: "CO.action.types.melee",
  },
  ranged: {
    id: "ranged",
    label: "CO.action.types.ranged",
  },
  magical: {
    id: "magical",
    label: "CO.action.types.magical",
  },
  heal: {
    id: "heal",
    label: "CO.action.types.heal",
  },
  buff: {
    id: "buff",
    label: "CO.action.types.buff",
  },
  debuff: {
    id: "debuff",
    label: "CO.action.types.debuff",
  },
})

export const RESOLVER_TARGET = Object.freeze({
  self: {
    id: "self",
    label: "CO.resolver.target.self",
  },
  character: {
    id: "character",
    label: "CO.resolver.target.character",
  },
  encounter: {
    id: "encounter",
    label: "CO.resolver.target.encounter",
  },
})
