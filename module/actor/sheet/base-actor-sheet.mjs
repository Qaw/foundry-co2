import {Log} from "../../utils/log.mjs";
import {CoSkillCheck} from "../../system/roll.mjs";

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options);
    // context.logoPath = this._getPathRoot() + this._getLogoPath();
    return context;
  }

  _onRoll(event) {

    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollType = dataset.rollType;
    const rolling = dataset.rolling;

    Log.debug(rolling);
    
    switch(rollType){
      case "skillcheck" : new CoSkillCheck(this.actor).init(event, rolling);
      case "combatcheck" : break;
    }
    // return this.actor.skillCheck(event, this.actor);
    // return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
  // /**
  //  * @name getPathRoot
  //  * @description get the path of the system or module
  //  *
  //  * @returns {String} The path
  //  */
  // _getPathRoot() {
  //   return "systems/co/";
  // }

  // /**
  //  * @name getLogoPath
  //  * @description get the url of logo's image
  //  *
  //  * @returns {String} Logo's url after PathRoot
  //  */
  // _getLogoPath() {
  //   return "/ui/logo-banner.webp";
  // }

}
