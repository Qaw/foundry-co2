export default class RulesEngine {
  static rules = [
    {
      name: "isEquipped",
      parameters: ["item"],
      expression: (object, item) => item.type === SYSTEM.ITEM_TYPE.equipment.id && item.system.equipped,
    },
    {
      name: "isLearned",
      parameters: ["item"],
      expression: (object, item) => item.type === SYSTEM.ITEM_TYPE.capacity.id && item.system.learned,
    },
    {
      name: "isOwned",
      parameters: ["item", "actor"],
      expression: (object, item, actor) => actor.items.find((i) => i.id === item.id) !== undefined,
    },
    {
      name: "isLinkedActionActivated",
      parameters: ["object", "item"],
      expression: (object, item) => item.system.actions[object].properties.enabled,
    },
    {
      name: "isTagged",
      parameters: ["item", "tag"],
      expression: (object, item, tag) => item.tags && item.tags.includes(tag),
    },
  ]

  static evaluate(condition, ...args) {
    const rule = this.rules.find((r) => r.name === condition.predicate) // Trouve la règle correspondante
    if (rule) {
      return rule.expression(condition.object, ...args) // Évalue l'expression avec les arguments
    }
    return false // Si la règle n'existe pas
  }
}
