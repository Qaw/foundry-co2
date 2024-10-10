import { SYSTEM } from "../../config/system.mjs"
export default class CoBaseItemSheet extends ItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = super.getData(options)
    //context.config = game.co.config
    context.debugMode = game.settings.get("co", "debugMode")
    context.system = this.item.system
    context.modifiers = this.item.modifiers
    context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description, { async: true })
    context.tags = this.item.tags

    context.choiceActionTypes = SYSTEM.ACTION_TYPES
    context.choiceConditionObjects = SYSTEM.CONDITION_OBJECTS
    context.choiceConditionPredicates = SYSTEM.CONDITION_PREDICATES
    context.choiceResolverTypes = SYSTEM.RESOLVER_TYPE
    return context
  }
}
