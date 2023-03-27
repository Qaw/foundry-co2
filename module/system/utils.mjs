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
  static evaluate(actor, formula, source) {
    if (formula === "") return 0;
    if (formula.includes("@") || formula.includes("#")) return this._evaluateCustom(actor, formula, source);
    const resultat = parseInt(formula);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

  /**
   * @description Evaluate a custom value
   * Shortcuts
   * @str @dex @con @int @wis @cha @mel @ran @mag @lvl @rank[+1,0,+1,0,0]
   * @param {*} actor
   * @returns {int} the modifier's value
   */
  static _evaluateCustom(actor, formula, source) {
    if (!formula.includes("@")) return value;

    Log.debug("Custom Formula : ", formula);

    let replacedFormula = formula;

    // Shortcuts
    if (replacedFormula.includes("@for")) replacedFormula = replacedFormula.replace("@for", actor.system.abilities.str.mod);
    if (replacedFormula.includes("@dex")) replacedFormula = replacedFormula.replace("@dex", actor.system.abilities.dex.mod);
    if (replacedFormula.includes("@con")) replacedFormula = replacedFormula.replace("@con", actor.system.abilities.con.mod);
    if (replacedFormula.includes("@int")) replacedFormula = replacedFormula.replace("@int", actor.system.abilities.int.mod);
    if (replacedFormula.includes("@sag")) replacedFormula = replacedFormula.replace("@sag", actor.system.abilities.wis.mod);
    if (replacedFormula.includes("@cha")) replacedFormula = replacedFormula.replace("@cha", actor.system.abilities.cha.mod);

    if (replacedFormula.includes("@atc")) replacedFormula = replacedFormula.replace("@atc", actor.system.combat.melee.mod);
    if (replacedFormula.includes("@atd")) replacedFormula = replacedFormula.replace("@atd", actor.system.combat.ranged.mod);
    if (replacedFormula.includes("@atm")) replacedFormula = replacedFormula.replace("@atm", actor.system.combat.magic.mod);
    if (replacedFormula.includes("@def")) replacedFormula = replacedFormula.replace("@def", actor.system.combat.def.value);

    if (replacedFormula.includes("@niv")) replacedFormula = replacedFormula.replace("@niv", actor.system.attributes.level.value);

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

    return eval(replacedFormula);
  }
}
