export default class CoBaseItemSheet extends ItemSheet {
    /** @override */
    getData(options) {
        const itemData = this.item.toObject(false);
        const context = super.getData(options);
        context.system = itemData.system;
        return context;
    }
}
  