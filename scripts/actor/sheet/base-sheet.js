export default class CoBaseActorSheet extends ActorSheet {
  //#region Context preparation

  /** @override */
  async getData(options) {
    const actorData = this.actor.toObject(false);

    const context = super.getData(options);
    context.logoPath = this._getPathRoot() + this._getLogoPath();
    context.system = actorData.system;
    context.xp = actorData.system.xp;
    context.characteristics = actorData.system.characteristics;

    return context;
  }

  /**
   * @name getPathRoot
   * @description obtenir le chemin du système ou module
   *
   * @returns {String} le chemin
   */
  _getPathRoot() {
    return "systems/co/";
  }

  /**
   * @name getLogoPath
   * @description obtenir l'url de l'image du logo
   *
   * @returns {String} L'url du logo après le PathRoot
   */
  _getLogoPath() {
    return "/ui/logo-banner.webp";
  }

  //#endregion
}
