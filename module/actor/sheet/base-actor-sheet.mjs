import {CoSkillCheck} from "../../system/roll.mjs";

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.config = game.co.config;
    context.debugMode = game.settings.get("co", "debugMode");
    return context;
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
