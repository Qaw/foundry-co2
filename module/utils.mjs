import { SYSTEM } from "./config/system.mjs"

export default class Utils {
  static shortcutResolve(shortcut) {
    return shortcut.replace("@", "system.")
  }

  /**
   * Generates a tooltip string based on the provided name and value.
   *
   * @param {string} name The name to be included in the tooltip.
   * @param {number} value The value to be included in the tooltip.
   * @returns {string} "Nom : valeur " the formatted tooltip string if both name and value are valid, otherwise an empty string.
   */
  static getTooltip(name, value) {
    if (name !== "" && value !== 0) {
      return `${name} : ${value} `
    }
    return ""
  }

  static log(message) {
    return `${SYSTEM.SYSTEM_DESCRIPTION} | ${message}`
  }

  static getAbilityName(ability) {
    return game.i18n.localize(`CO.abilities.long.${ability}`)
  }

  /**
   * For an actor, evaluate the formula
   * @param {*} actor
   * @param {*} formula
   * @param {*} source The item source's UUID : used for the #rank
   * @param {boolean} toEvaluate
   * @returns {int} the formula's value
   */
  static evaluate(actor, formula, source, toEvaluate = false) {
    if (formula === "") return 0
    if (formula.includes("@")) return this._evaluateCustom(actor, formula, source, toEvaluate, false)
    const resultat = parseInt(formula)
    if (isNaN(resultat)) return 0
    return resultat
  }

  /**
   * For an actor, evaluate the formula
   * @param {*} actor
   * @param {*} formula
   * @param {*} source The item source's UUID : used for the #rank
   * @returns
   */
  static evaluateWithDice(actor, formula, source) {
    if (formula === "") return ""
    if (formula.includes("@")) return this._evaluateCustom(actor, formula, source, true, true)
    return formula
  }

  /**
   * Evaluate a custom value
   * Shortcuts : @str @dex @con @int @wis @cha @mel @ran @mag @lvl @rank[+1,0,+1,0,0]
   * @param {*} actor
   * @param {} formula
   * @param {} source The item source's UUID : used for the #rank
   * @param {boolean} toEvaluate : true to evaluate the replaced formula
   * @param {boolean} withDice : true if there is dice in the formula ; if yes toEvaluate should be false
   * @returns {int} the modifier's value
   */
  static _evaluateCustom(actor, formula, source, toEvaluate, withDice) {
    let replacedFormula = formula
    const DSL = {
      "@for": "system.abilities.str.mod",
      "@str": "system.abilities.str.mod",
      "@dex": "system.abilities.dex.mod",
      "@con": "system.abilities.con.mod",
      "@int": "system.abilities.int.mod",
      "@sag": "system.abilities.wis.mod",
      "@wis": "system.abilities.wis.mod",
      "@cha": "system.abilities.cha.mod",
      "@atc": "system.combat.melee.value",
      "@melee": "system.combat.melee.value",
      "@atd": "system.combat.ranged.value",
      "@ranged": "system.combat.ranged.value",
      "@atm": "system.combat.magic.value",
      "@magic": "system.combat.magic.value",
      "@def": "system.combat.def.value",
      "@niv": "system.attributes.level.base",
      "@lvl": "system.attributes.level.base",
    }

    // Shortcuts
    Object.keys(DSL).forEach((shortcut) => {
      if (replacedFormula.includes(shortcut)) replacedFormula = replacedFormula.replace(shortcut, foundry.utils.getProperty(actor, DSL[shortcut]))
    })

    if (replacedFormula.includes("@rang")) {
      let startRank = replacedFormula.substring(replacedFormula.indexOf("@rang"))
      let extract = startRank.substring(replacedFormula.indexOf("[") + 1, replacedFormula.indexOf("]"))
      let ranks = extract.split(",")
      let itemSource = actor.items.get(source)
      const pathId = itemSource.system.path
      const path = actor.items.get(pathId)
      const rank = path.system.rank
      let total = 0
      if (rank) {
        for (let index = 0; index < rank; index++) {
          const element = ranks[index]
          let val = parseInt(element)
          if (val) total += val
        }
      }
      replacedFormula = replacedFormula.replace(`@rang[${extract}]`, total)
    }

    if (replacedFormula.includes("@rank")) {
      let startRank = replacedFormula.substring(replacedFormula.indexOf("@rank"))
      let extract = startRank.substring(replacedFormula.indexOf("[") + 1, replacedFormula.indexOf("]"))
      let ranks = extract.split(",")
      let itemSource = actor.items.get(source)
      const pathId = itemSource.system.path
      const path = actor.items.get(pathId)
      const rank = path.system.rank
      let total = 0
      if (rank) {
        for (let index = 0; index < rank; index++) {
          const element = ranks[index]
          let val = parseInt(element)
          if (val) total += val
        }
      }
      replacedFormula = replacedFormula.replace(`@rank[${extract}]`, total)
    }

    // Remaining formula
    if (replacedFormula.includes("@")) {
      replacedFormula = replacedFormula.replace("@", "actor.system.")
    }

    if (withDice) return replacedFormula
    else {
      if (toEvaluate) return eval(replacedFormula)
      else return replacedFormula
    }
  }

  // FIXME !! C'est quoi ?
  // replacedFormula = _processFormulaKeyword("@rang", replacedFormula, source)

  // FIXME !! C'est quoi ?
  // replacedFormula = _processFormulaKeyword("@rank", replacedFormula, source)

  _processFormulaKeyword(keyword, replacedFormula, source) {
    if (replacedFormula.includes(keyword)) {
      let keywordIndex = replacedFormula.indexOf(keyword)
      let startRank = replacedFormula.substring(keywordIndex)
      let openBracketIndex = replacedFormula.indexOf("[", keywordIndex) + 1
      let closeBracketIndex = replacedFormula.indexOf("]", keywordIndex)
      let extract = startRank.substring(openBracketIndex, closeBracketIndex)

      let ranks = extract.split(",")
      let itemSource = actor.items.get(source)
      const pathId = itemSource.system.path
      const path = actor.items.get(pathId)
      const rank = path.system.rank
      let total = 0

      if (rank) {
        for (let index = 0; index < rank; index++) {
          const element = ranks[index]
          let val = parseInt(element, 10)
          if (val) total += val
        }
      }

      replacedFormula = replacedFormula.replace(`${keyword}[${extract}]`, total)
    }
    return replacedFormula
  }
}
