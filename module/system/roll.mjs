import { Utils } from "./utils.mjs"
import CoChat from "../chat.mjs"
import { CoAttackRollDialog, CoSkillRollDialog } from "../dialogs/dialog-roll.mjs"

class CoRoll {
  constructor(actor) {
    this.actor = actor
  }

  init(args) {}

  dialog(label) {}

  roll() {}

  chat() {}
}

export class CoSkillCheck extends CoRoll {
  init(rolling) {
    return this.dialog(rolling)
  }

  async dialog(rolling) {
    console.log(("rolling : ", rolling))

    const rollingSkill = foundry.utils.getProperty(this.actor, Utils.shortcutResolve(rolling))
    let parts = rolling.replace("@", "").split(".")

    const rollingLabel = `${game.i18n.localize("CO.dialogs.skillCheck")} - ${game.i18n.localize(`CO.${parts[0]}.long.${parts[1]}`)}`

    const carac = rollingSkill.value

    // CoSkillRollDialog
    this.label = rollingLabel
    this.skill = rollingSkill
    const dialogData = {
      label: rollingLabel,
      bonus: 0,
      malus: 0,
      carac: carac,
      critrange: 20,
      superior: false,
      weakened: false,
      difficulty: 10,
      showDifficulty: true,
      skillBonuses: await this.actor.getSkillBonuses(parts[1]),
      totalSkillBonuses: 0,
    }

    let rollDialog = await CoSkillRollDialog.create(this, dialogData)
    rollDialog.render(true)
  }

  roll(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange) {
    let r = new CoSkillRoll(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange)
    return r.roll(this.actor)
  }

  async chat(roll) {
    await new CoChat(this.actor)
      .withTemplate("systems/co/templates/chat/skillcheck-card.hbs")
      .withData({
        actorId: this.actor.id,
        label: roll._label,
        formula: roll._formula,
        difficulty: roll._difficulty,
        showDifficulty: !!roll._difficulty,
        isCritical: roll._isCritical,
        isFumble: roll._isFumble,
        isSuccess: roll._isSuccess,
        isFailure: !roll._isSuccess,
        total: roll._rollTotal,
        toolTip: roll._toolTip,
      })
      .withRoll(roll._roll)
      .create()
  }
}

export class CoDmgRoll extends CoRoll {
  roll(event, actor, rolling) {
    console.debug(game.co.log("DMG ROLL"))
  }

  dialog() {}

  chat() {}
}

export class CoAttackCheck extends CoRoll {
  constructor(actor, item) {
    super(actor)
    this.item = item
  }

  /**
   * Prepare la fenêtre de dialogue
   * @param {Object} rolling {actionName, itemName, skillFormula, skillFormulaEvaluated, damageFormulaEvaluated, crit, diff}
   * @returns {Dialog} a dialog box
   */
  init(rolling) {
    return this.dialog(rolling)
  }

  async dialog(rolling) {
    const rollingLabel = `${rolling.actionName} (${rolling.itemName})`
    this.label = rollingLabel

    const dialogData = {
      label: rollingLabel,
      critrange: !rolling.auto ? rolling.crit : "",
      difficulty: !rolling.auto ? rolling.diff : "",
      showDifficulty: !rolling.auto,
      skillFormula: !rolling.auto ? rolling.skillFormula : "",
      formulaAttack: !rolling.auto ? rolling.skillFormulaEvaluated : "",
      formulaDamage: rolling.damageFormulaEvaluated,
      auto: rolling.auto,
      type: rolling.type,
    }

    const rollDialog = await CoAttackRollDialog.create(this, dialogData)
    rollDialog.render(true)
  }

  /**
   * Lance le jet d'attaque
   * @param {*} label
   * @param {*} dice
   * @param {*} formulaAttack
   * @param {*} formulaDamage
   * @param {*} difficulty
   * @param {*} critrange
   * @returns
   */
  rollAttack(label, dice, formulaAttack, formulaDamage, difficulty, critrange) {
    let r = new CoAttackRoll(label, dice, formulaAttack, formulaDamage, difficulty, critrange)
    return r.roll(this.actor)
  }

  rollDamage(label, formulaDamage) {
    let r = new CoDamageRoll(label, formulaDamage)
    return r.roll(this.actor)
  }

  rollAuto(label, dice, formulaAttack, difficulty, critrange) {
    let r = new CoAttackRoll(label, dice, formulaAttack, formulaDamage, difficulty, critrange)
    return r.roll(this.actor)
  }

  async chat(roll, type) {
    new CoChat(this.actor)
      .withTemplate("systems/co/templates/chat/attack-card.hbs")
      .withData({
        typeAttack: type === "attack",
        typeDamage: type === "damage",
        actorId: this.actor.id,
        label: roll._label,
        formula: roll._formula,
        difficulty: roll._difficulty,
        showDifficulty: !!roll._difficulty,
        isCritical: roll._isCritical,
        isFumble: roll._isFumble,
        isSuccess: roll._isSuccess,
        isFailure: !roll._isSuccess,
        total: roll._rollTotal,
        toolTip: roll._toolTip,
      })
      .withRoll(roll._roll)
      .create()
  }
}

export class CoSkillRoll {
  constructor(label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange) {
    this._label = label
    this._dice = dice
    this._mod = mod
    this._bonus = bonus
    this._malus = malus
    this._totalSkillBonuses = totalSkillBonuses
    this._totalBonusMalus = parseInt(this._bonus) + parseInt(this._malus) + parseInt(this._totalSkillBonuses)
    this._total = parseInt(this._mod) + this._totalBonusMalus
    this._difficulty = difficulty
    this._critrange = critrange
    this._formula = this._total === 0 ? this._dice : this._totalBonusMalus === 0 ? `${this._dice} ${this._mod}` : `${this._dice} ${this._mod} + ${this._totalBonusMalus}`
    this._isCritical = false
    this._isFumble = false
    this._isSuccess = false
    this._roll = null
    this._toolTip = null
  }

  /**
   * Roll the dice
   * @param {*} actor
   * @returns {CoSkillRoll} the roll
   */
  async roll(actor) {
    let r = new Roll(this._formula)
    await r.roll()
    // Getting the dice kept in case of 2d12 or 2d20 rolls
    const result = r.terms[0].results.find((r) => r.active).result
    this._isCritical = result >= this._critrange.split("-")[0] || result === 20
    this._isFumble = result === 1
    if (this._difficulty) {
      this._isSuccess = r.total >= this._difficulty
    }
    this._roll = r
    this._rollTotal = r._total
    this._toolTip = new Handlebars.SafeString(await r.getTooltip())
    return this
  }

  /**
   * Jet de dommages d'une arme
   *
   * @param {*} actor
   * @param {*} dmgFormula
   * @param {*} dmgDescr
   * @returns {CoSkillRoll} the roll
   */
  async weaponRoll(actor, dmgFormula, dmgDescr) {
    await this.roll(actor)
    if (this._difficulty) {
      if (this._isSuccess && game.settings.get("cof", "useComboRolls")) {
        let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr)
        await r.roll(actor)
        return r
      }
    } else {
      if (game.settings.get("cof", "useComboRolls")) {
        let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr)
        await r.roll(actor)
        return r
      }
    }
  }
}

export class CoAttackRoll {
  constructor(label, dice, formulaAttack, formulaDamage, difficulty, critrange) {
    this._label = label
    this._dice = dice
    this._formulaAttack = formulaAttack
    this._formulaDamage = formulaDamage
    this._difficulty = difficulty
    this._critrange = critrange
    this._formula = `${this._dice} + ${this._formulaAttack}`
    this._isCritical = false
    this._isFumble = false
    this._isSuccess = false
    this._roll = null
    this._toolTip = null
  }

  /**
   * Roll the dice
   * @param {*} actor
   * @returns {CoAttackRoll} the roll
   */
  async roll(actor) {
    let r = new Roll(this._formula)
    await r.roll()
    // Getting the dice kept in case of 2d12 or 2d20 rolls
    const result = r.terms[0].results.find((r) => r.active).result
    this._isCritical = result >= this._critrange.split("-")[0] || result === 20
    this._isFumble = result === 1
    if (this._difficulty) {
      this._isSuccess = r.total >= this._difficulty
    }
    this._roll = r
    this._rollTotal = r._total
    this._toolTip = new Handlebars.SafeString(await r.getTooltip())
    return this
  }
}

export class CoDamageRoll {
  constructor(label, formulaDamage) {
    this._label = label
    this._formula = formulaDamage
  }

  /**
   * Roll the dice
   * @param {*} actor
   * @returns {CoDamageRoll} the roll
   */
  async roll(actor) {
    let r = new Roll(this._formula)
    await r.roll()
    this._roll = r
    this._rollTotal = r._total
    this._toolTip = new Handlebars.SafeString(await r.getTooltip())
    return this
  }
}
