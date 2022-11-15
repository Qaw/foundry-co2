export default class CoBaseItemSheet extends ItemSheet {
    /** @override */
    async getData(options={}) {
        const context = super.getData(options);
        context.system = this.item.system;

        context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description.value, {async: true});
        return context;
    }
}
  