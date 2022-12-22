import { CO } from "./config.mjs";

export class Utils {
  static shortcutResolve(shortcut) {
    return shortcut.replace("@", "system.");
  }

  static getModFromValue = function (value) {
    return value < 4 ? -4 : Math.floor(value / 2) - 5;
  };

  static getValueFromMod = function (mod) {
    return mod * 2 + 10;
  };

  /**
   * @name getTooltip
   * @param {*} name 
   * @param {*} value 
   * @returns {String} Chaine vide ou "Nom : valeur "
   */
  static getTooltip(name, value) {
    if (name !== "" && value > 0) {
      return name + " : " + value + " ";
    }
    return "";
  }

  static getAbilityName(ability) {
    return game.i18n.localize(`CO.abilities.long.${ability}`);
  }

  /**
   * @description For an actor, evaluate the formula
   * @param {*} actor 
   * @param {*} formula 
   * @param {*} source The item source's UUID : used for the #rank
   * @returns 
   */
  static evaluate(actor, formula, source){
    if (formula === "") return 0;
    if (formula.includes("@") || formula.includes("#")) return this._evaluateCustom(actor, formula, source);
    const resultat = parseInt(formula);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

   /**
   * @description Evaluate a custom value
   * @param {*} actor
   * @returns {int} the modifier's value
   */
     static _evaluateCustom(actor, formula, source) {
      if (!formula.includes("@") && !formula.includes("#")) return value;
      let replacedFormula = formula;

      // #level
      if (formula.includes("#level")) {
        replacedFormula = replacedFormula.replace("#level", actor.system.attributes.level.value);
      }
  
      // #rank{+1,0,+1,0,0}
      if (formula.includes("#rank")) {
        let startRank = formula.substring(formula.indexOf("#rank"));
        let extract = startRank.substring(formula.indexOf("[") + 1, formula.indexOf("]"));
        let ranks = extract.split(",");
        let itemSource = fromUuidSync(source);
        let rank = itemSource.system.rank;
        let total = 0;
        for (let index = 0; index < rank; index++) {
          const element = ranks[index];
          let val = parseInt(element);
          if (val) total += val;
        }
        replacedFormula = replacedFormula.replace("#rank[" + extract + "]", total) ;
      }
  
      // #mod{str}
      if (formula.includes("#mod")) {
        let ability = formula.substring(formula.indexOf("[") + 1, formula.indexOf("]"));
        replacedFormula = replacedFormula.replace("#mod[" + ability + "]", "actor.system.abilities." + ability + ".mod" );
      }
  
      // @abilities.str.value
      if (formula.includes("@")) {
        replacedFormula = replacedFormula.replace("@", "actor.system.");
      }

      return eval(replacedFormula);
    }



}
