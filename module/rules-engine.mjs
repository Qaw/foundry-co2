export default class RulesEngine {
  static rules = [
    {
      name: "isEquipped",
      parameters: ["item"],
      expression: (item) => item.type === SYSTEM.ITEM_TYPE.equipment.id && item.system.equipped,
    },
    {
      name: "isLearned",
      parameters: ["item"],
      expression: (item) => item.type === SYSTEM.ITEM_TYPE.capacity.id && item.system.learned,
    },
    {
      name: "isOwned",
      parameters: ["item", "actor"],
      expression: (item, actor) => actor.items.find((i) => i.id === item.id) !== undefined,
    },
    {
      name: "isTagged",
      parameters: ["item", "tag"],
      expression: (item, tag) => item.tags && item.tags.includes(tag),
    },
    {
      name: "isEqualTo",
      parameters: ["item", "value"],
      expression: (item, value) => item.value === value,
    },
    {
      name: "isSuccess",
      parameters: ["item"],
      expression: (item) => item.successRate >= 50,
    },
    {
      name: "isFailure",
      parameters: ["item"],
      expression: (item) => item.failureRate >= 50,
    },
    {
      name: "isCritical",
      parameters: ["item"],
      expression: (item) => item.criticalHit === true,
    },
    {
      name: "isAbilityType",
      parameters: ["item", "abilityType"],
      expression: (item, abilityType) => item.abilityType === abilityType,
    },
    {
      name: "melee",
      parameters: ["item"],
      expression: (item) => item.weaponType === "melee",
    },
    {
      name: "ranged",
      parameters: ["item"],
      expression: (item) => item.weaponType === "ranged",
    },
    {
      name: "magical",
      parameters: ["item"],
      expression: (item) => item.weaponType === "magical",
    },
    {
      name: "armor",
      parameters: ["item"],
      expression: (item) => item.type === SYSTEM.ITEM_TYPE.armor.id,
    },
    {
      name: "weapon",
      parameters: ["item"],
      expression: (item) => item.type === SYSTEM.ITEM_TYPE.weapon.id,
    },
  ]

  static evaluate(ruleName, ...args) {
    const rule = this.rules.find((r) => r.name === ruleName)
    if (rule) {
      return rule.expression(...args) // Évalue l'expression avec les arguments
    }
    return false // Si la règle n'existe pas
  }
}
