export default class CoBaseItemSheet extends ItemSheet {
    /** @override */
    getData(options={}) {
        const context = super.getData(options);
        context.config = CONFIG.CO;
        context.system = this.item.system;
        context.modifiers = this.item.system.modifiers;
        // context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description.value, {async: true});
        return context;
    }
}
  