export default class CoBaseItemSheet extends ItemSheet {
    /** @override */
    getData(options={}) {
        const context = super.getData(options);
        context.config = game.co.config;
        context.system = this.item.system;
        context.modifiers = this.item.system.modifiers;
        context.enrichedDescription = TextEditor.enrichHTML(this.item.system.description.value, {async: false});
        return context;
    }
}
  