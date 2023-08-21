export default class CoBaseItemSheet extends ItemSheet {
  /** @override */
  getData(options = {}) {
    const context = super.getData(options);
    context.config = game.co.config;
    context.debugMode = game.settings.get("co", "debugMode");
    context.system = this.item.system;
    context.modifiers = this.item.modifiers;
    context.enrichedDescription = TextEditor.enrichHTML(this.item.system.common.description.value, { async: false });
    context.tags = this.item.tags;
    return context;
  }
}
