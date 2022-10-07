export default class CoBaseActorSheet extends ActorSheet {
  //#region Context preparation

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.logoPath = this._getPathRoot() + this._getLogoPath();
    return context;
  }

  /**
   * @name getPathRoot
   * @description get the path of the system or module
   *
   * @returns {String} The path
   */
  _getPathRoot() {
    return "systems/co/";
  }

  /**
   * @name getLogoPath
   * @description get the url of logo's image
   *
   * @returns {String} Logo's url after PathRoot
   */
  _getLogoPath() {
    return "/ui/logo-banner.webp";
  }

  //#endregion
}
