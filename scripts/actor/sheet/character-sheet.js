import CoBaseActorSheet from "./base-sheet.js";

export default class CoCharacterSheet extends CoBaseActorSheet {
  //#region Default
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["co", "sheet", "actor", "character"],
      width: 1600,
      height: 600,
    });
  }

  /** @override */
  get template() {
    return "systems/co/templates/actors/character-sheet.hbs";
  }

  //#endregion

  //#region Context preparation

  /** @override */
  async getData(options) {
    const context = super.getData(options);

    return context;
  }

  //#endregion
}
