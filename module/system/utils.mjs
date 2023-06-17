import { Log } from "../utils/log.mjs";

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
    if (name !== "" && value !== 0) {
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
  static evaluate(actor, formula, source, toEvaluate = false) {
    if (formula === "") return 0;
    if (formula.includes("@")) return this._evaluateCustom(actor, formula, source, toEvaluate);
    const resultat = parseInt(formula);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

  /**
   * @description Evaluate a custom value
   * Shortcuts
   * @str @dex @con @int @wis @cha @mel @ran @mag @lvl @rank[+1,0,+1,0,0]
   * @param {*} actor
   * @param {} formula
   * @param {} source
   * @param {Boolean} eval : true to evaluate the replaced formula
   * @returns {int} the modifier's value
   */
  static _evaluateCustom(actor, formula, source, toEvaluate) {
    Log.debug("Custom Formula : ", formula);

    let replacedFormula = formula;
    const DSL = {
      "@for" : "actor.system.abilities.str.mod",
      "@str" : "actor.system.abilities.str.mod",
      "@dex" : "actor.system.abilities.dex.mod",
      "@con" : "actor.system.abilities.con.mod",
      "@int" : "actor.system.abilities.int.mod",
      "@sag" : "actor.system.abilities.wis.mod",
      "@wis" : "actor.system.abilities.wis.mod",
      "@cha" : "actor.system.abilities.cha.mod",
      "@atc" : "actor.system.abilities.melee.mod",
      "@melee" : "actor.system.abilities.melee.mod",
      "@atd" : "actor.system.abilities.ranged.mod",
      "@ranged" : "actor.system.abilities.ranged.mod",
      "@atm" : "actor.system.abilities.magic.mod",
      "@magic" : "actor.system.abilities.magic.mod",
      "@def" : "actor.system.abilities.def.value",
      "@niv" : "actor.system.attributes.level.value",
      "@lvl" : "actor.system.attributes.level.value"
    }

    // Shortcuts
    Object.keys(DSL).forEach(shortcut => {
      if(replacedFormula.includes(shortcut)) replacedFormula = replacedFormula.replace(shortcut, eval(DSL[shortcut]));
    });

    if (replacedFormula.includes("@rang")) {
      let startRank = replacedFormula.substring(replacedFormula.indexOf("@rang"));
      let extract = startRank.substring(replacedFormula.indexOf("[") + 1, replacedFormula.indexOf("]"));
      let ranks = extract.split(",");
      let itemSource = actor.items.get(source);
      const pathId = itemSource.system.path;
      const path = actor.items.get(pathId);
      const rank = path.system.rank;
      let total = 0;
      if (rank) {
        for (let index = 0; index < rank; index++) {
          const element = ranks[index];
          let val = parseInt(element);
          if (val) total += val;
        }
      }
      replacedFormula = replacedFormula.replace("@rang[" + extract + "]", total);
    }

    // Remaining formula
    if (replacedFormula.includes("@")) {
      replacedFormula = replacedFormula.replace("@", "actor.system.");
    }

    Log.debug("Custom Formula evaluated : ", replacedFormula);

    if (toEvaluate) return eval(replacedFormula);
    else return replacedFormula;
  }
}
