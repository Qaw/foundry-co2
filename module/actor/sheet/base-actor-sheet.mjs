import {CoSkillCheck} from "../../system/roll.mjs";

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.config = game.co.config;
    context.debugMode = game.settings.get("co", "debugMode");
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".section-toggle").click(this._onSectionToggle.bind(this));
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));
  }

  /**
   * Manage the lock/unlock button on the sheet
   *
   * @name _onSheetChangelock
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.actor.sheet.render(true);
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  _onSectionToggle(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents().next(".foldable");
    // const li = $(event.currentTarget).parent().next(".foldable");
    li.slideToggle("fast");
    return true;
  }

  _onRoll(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollType = dataset.rollType;
    const rolling = dataset.rolling;

    // console.debug(game.co.log(rolling));
    
    switch(rollType){
      case "skillcheck" : new CoSkillCheck(this.actor).init(rolling);
      case "combatcheck" : break;
    }
    // return this.actor.skillCheck(event, this.actor);
    // return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
}
