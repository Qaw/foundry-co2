export class Utils {
  static shortcutResolve(shortcut) {
    return shortcut.replace("@", "system.");
  }

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
    if (formula.includes("@")) return this._evaluateCustom(actor, formula, source, toEvaluate, false);
    const resultat = parseInt(formula);
    if (isNaN(resultat)) return 0;
    return resultat;
  }

    /**
   * @description For an actor, evaluate the formula
   * @param {*} actor
   * @param {*} formula
   * @param {*} source The item source's UUID : used for the #rank
   * @returns
   */
    static evaluateWithDice(actor, formula, source) {
      if (formula === "") return "";
      if (formula.includes("@")) return this._evaluateCustom(actor, formula, source, true, true);
      return formula;      
    }

  /**
   * @description Evaluate a custom value
   * Shortcuts
   * @str @dex @con @int @wis @cha @mel @ran @mag @lvl @rank[+1,0,+1,0,0]
   * @param {*} actor
   * @param {} formula 
   * @param {} source The item source's UUID : used for the #rank
   * @param {Boolean} toEvaluate : true to evaluate the replaced formula
   * @param {Boolean} withDice : true if there is dice in the formula ; if yes toEvaluate should be false
   * @returns {int} the modifier's value
   */
  static _evaluateCustom(actor, formula, source, toEvaluate, withDice) {
    console.debug(game.co.log("Custom Formula : ", formula));

    let replacedFormula = formula;
    const DSL = {
      "@for" : "system.abilities.str.mod",
      "@str" : "system.abilities.str.mod",
      "@dex" : "system.abilities.dex.mod",
      "@con" : "system.abilities.con.mod",
      "@int" : "system.abilities.int.mod",
      "@sag" : "system.abilities.wis.mod",
      "@wis" : "system.abilities.wis.mod",
      "@cha" : "system.abilities.cha.mod",
      "@atc" : "system.combat.melee.value",
      "@melee" : "system.combat.melee.value",
      "@atd" : "system.combat.ranged.value",
      "@ranged" : "system.combat.ranged.value",
      "@atm" : "system.combat.magic.value",
      "@magic" : "system.combat.magic.value",
      "@def" : "system.combat.def.value",
      "@niv" : "system.attributes.level.base",
      "@lvl" : "system.attributes.level.base"
    }

    // Shortcuts
    Object.keys(DSL).forEach(shortcut => {
      if(replacedFormula.includes(shortcut)) replacedFormula = replacedFormula.replace(shortcut, foundry.utils.getProperty(actor, DSL[shortcut]));
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

    if (replacedFormula.includes("@rank")) {
      let startRank = replacedFormula.substring(replacedFormula.indexOf("@rank"));
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
      replacedFormula = replacedFormula.replace("@rank[" + extract + "]", total);
    }

    // Remaining formula
    if (replacedFormula.includes("@")) {
      replacedFormula = replacedFormula.replace("@", "actor.system.");
    }

    console.debug(game.co.log("Custom Formula evaluated : ", replacedFormula));

    if (withDice) return replacedFormula;
    else {
      if (toEvaluate) return eval(replacedFormula);
      else return replacedFormula;
    }
  }
}
