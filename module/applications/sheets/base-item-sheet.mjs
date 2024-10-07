export default class CoBaseItemSheet extends ItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = super.getData(options)
    context.config = game.co.config
    context.debugMode = game.settings.get("co", "debugMode")
    context.system = this.item.system
    context.modifiers = this.item.modifiers
    context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description, { async: true })
    context.tags = this.item.tags
    return context
  }
}
