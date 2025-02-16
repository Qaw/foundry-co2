import Utils from "../utils.mjs"
export class CORoll extends Roll {
  static ROLL_TYPE = "standard"

  /** @override  */
  async render({ flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false } = {}) {
    if (!this._evaluated) await this.evaluate({ allowInteractive: !isPrivate })
    const chatData = await this._getChatCardData(flavor, isPrivate)
    return renderTemplate(template, chatData)
  }

  async _getChatCardData(flavor, isPrivate) {
    return {
      formula: isPrivate ? "???" : this.formula,
      flavor: isPrivate ? null : (flavor ?? this.options.flavor),
      user: game.user.id,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
    }
  }
}

export class COSkillRoll extends CORoll {
  static ROLL_TYPE = "skill"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/skill-roll-dialog.hbs"

  static CHAT_TEMPLATE = "systems/co/templates/chat/skill-roll-card.hbs"

  static ROLL_CSS = ["co", "skill-roll"]

  /**
   * Affiche une boîte de dialogue pour lancer un jet de compétence et retourne le résultat du jet.
   *
   * @param {Object} dialogContext Le contexte de la boîte de dialogue, contenant des informations comme l'acteur et le label.
   * @param {Object} [options={}] Options supplémentaires pour le jet de compétence.
   * @returns {Promise<Object|null>} Le résultat du jet de compétence ou null si la boîte de dialogue a été annulée.
   *
   * @example
   * const dialogContext = {
   *   label: "Roll for Initiative",
   *   actor: someActor
   * };
   * const roll = await COSkillRoll.prompt(dialogContext);
   * if (roll) {
   *   console.log("Roll result:", roll.total);
   * }
   */
  static async prompt(dialogContext, options = {}) {
    const content = await renderTemplate(this.DIALOG_TEMPLATE, dialogContext)

    const rollContext = await foundry.applications.api.DialogV2.wait({
      window: { title: dialogContext.label },
      position: { width: "auto" },
      classes: this.ROLL_CSS,
      content,
      rejectClose: false,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("CO.ui.cancel"),
          icon: "fas fa-times",
          callback: () => false,
        },
        {
          action: "ok",
          label: game.i18n.localize("CO.ui.submit"),
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COSkillRoll prompt - Callback`), event, button, dialog)
            const output = Array.from(button.form.elements).reduce((obj, input) => {
              if (input.name) obj[input.name] = input.value
              return obj
            }, {})
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COSkillRoll prompt - Output`), output)
            /* 
            {
                "dice": "1d20",
                "skillValue": "+4",
                "critrange": "20",
                "bonus": "+0",
                "malus": "+0",
                "difficulty": "10",
                "totalSkillBonuses": "0",
                "label": "Test de compétence  Constitution"
            }
            */
            return output
          },
        },
      ],
      render: (event, dialog) => {
        const inputs = dialog.querySelectorAll(".bonus-item")
        if (inputs) {
          inputs.forEach((input) => {
            input.addEventListener("click", this._onToggleCheckSkillBonus.bind(this))
          })
        }
      },
    })

    if (!rollContext) return
    rollContext.label = dialogContext.label
    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COSkillRoll - rollContext`), rollContext)

    const formula = Utils.evaluateFormulaCustomValues(
      dialogContext.actor,
      `${rollContext.dice}+${parseInt(rollContext.skillValue)}+${parseInt(rollContext.bonus)}+${parseInt(rollContext.malus)}+${parseInt(rollContext.totalSkillBonuses)}`,
    )

    const roll = new this(formula, dialogContext.actor.getRollData())
    await roll.evaluate()

    // Récupération du résultat du jet (pour gérer les jets avec avantages/désavantages)
    const result = roll.terms[0].results.find((r) => r.active).result
    const isCritical = result >= rollContext.critrange || result === 20
    const isFumble = result === 1
    const showDifficulty = !!rollContext.difficulty
    let isSuccess = false
    if (rollContext.difficulty) {
      isSuccess = roll.total >= rollContext.difficulty
    }
    const toolTip = new Handlebars.SafeString(await roll.getTooltip())

    roll.options = {
      label: dialogContext.label,
      actorId: dialogContext.actor.id,
      isSuccess,
      isCritical,
      isFumble,
      showDifficulty,
      difficulty: rollContext.difficulty,
      toolTip,
      ...options,
    }

    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COSkillRoll - roll`), roll)
    return roll
  }

  static _onToggleCheckSkillBonus(event) {
    let item = event.currentTarget.closest(".bonus-item")
    item.classList.toggle("checked")
    let total = this._calculateTotalSkillBonus(event)
    document.querySelector("#totalSkillBonuses").value = total
  }

  static _calculateTotalSkillBonus(event) {
    let parent = event.currentTarget.closest(".skill-bonuses")
    const skillBonuses = Array.from(parent.querySelectorAll(".bonus-item.checked"))
    let total = skillBonuses.reduce((acc, curr) => acc + parseInt(curr.dataset.value), 0)
    return total
  }

  async _getChatCardData(flavor, isPrivate) {
    return {
      actorId: this.options.actorId,
      label: this.options.label,
      formula: isPrivate ? "???" : this.formula,
      showDifficulty: this.options.showDifficulty,
      difficulty: this.options.difficulty,
      isCritical: this.options.isCritical,
      isFumble: this.options.isFumble,
      isSuccess: this.options.isSuccess,
      isFailure: !this.options.isSuccess,
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
      user: game.user.id,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      toolTip: this.options.toolTip,
    }
  }
}

export class COAttackRoll extends CORoll {
  static ROLL_TYPE = "attack"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/attack-roll-dialog.hbs"

  static CHAT_TEMPLATE = "systems/co/templates/chat/attack-roll-card.hbs"

  static ROLL_CSS = ["co", "attack-roll"]

  static async prompt(dialogContext, options = {}) {
    // Le résultat est un jet d'attaque ou un jet d'attaque et un jet de dégâts
    let rolls = []
    const content = await renderTemplate(this.DIALOG_TEMPLATE, dialogContext)

    const rollContext = await foundry.applications.api.DialogV2.wait({
      window: { title: dialogContext.label },
      position: { width: "auto" },
      classes: this.ROLL_CSS,
      content,
      rejectClose: false,
      buttons: [
        {
          action: "cancel",
          label: game.i18n.localize("CO.ui.cancel"),
          icon: "fas fa-times",
          callback: () => false,
        },
        {
          action: "ok",
          label: game.i18n.localize("CO.ui.submit"),
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COAttackRoll prompt - Callback`), event, button, dialog)
            const output = Array.from(button.form.elements).reduce((obj, input) => {
              if (input.name) obj[input.name] = input.value
              return obj
            }, {})
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COAttackRoll prompt - Output`), output)
            /* 
            {
                "dice": "1d20",
                "skillValue": "+4",
                "critrange": "20",
                "bonus": "+0",
                "malus": "+0",
                "difficulty": "10",
                "totalSkillBonuses": "0",
                "label": "Test de compétence  Constitution"
            }
            */
            return output
          },
        },
      ],
      render: (event, dialog) => {
        const inputs = dialog.querySelectorAll(".bonus-item")
        if (inputs) {
          inputs.forEach((input) => {
            input.addEventListener("click", this._onToggleCheckSkillBonus.bind(this))
          })
        }
      },
    })

    if (!rollContext) return
    rollContext.label = dialogContext.label
    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COAttackRoll - rollContext`), rollContext)

    if (dialogContext.type === "attack") {
      const formula = Utils.evaluateFormulaCustomValues(dialogContext.actor, `${rollContext.dice}+${rollContext.formulaAttack}`)
      const roll = new this(formula, dialogContext.actor.getRollData())
      await roll.evaluate()

      // Récupération du résultat du jet (pour gérer les jets avec avantages/désavantages)
      const result = roll.terms[0].results.find((r) => r.active).result
      const isCritical = result >= rollContext.critrange || result === 20
      const isFumble = result === 1
      const showDifficulty = !!rollContext.difficulty
      let isSuccess = false
      if (rollContext.difficulty) {
        isSuccess = roll.total >= rollContext.difficulty
      }
      const toolTip = new Handlebars.SafeString(await roll.getTooltip())

      roll.options = {
        type: dialogContext.type,
        label: dialogContext.label,
        actorId: dialogContext.actor.id,
        isSuccess,
        isCritical,
        isFumble,
        showDifficulty,
        difficulty: rollContext.difficulty,
        toolTip,
        ...options,
      }

      rolls.push(roll)

      // Jet de dégâts si l'option Jet combiné est activée et que l'attaque est une réussite
      // FIXME isSuccess n'a de sens que si l'option activée est celle d'utiliser la difficultés
      // Ajouter && isSuccess ?
      if (dialogContext.useComboRolls) {
        const damageFormula = Utils.evaluateFormulaCustomValues(dialogContext.actor, `${rollContext.formulaDamage}`)
        const damageRoll = new this(damageFormula, dialogContext.actor.getRollData())
        await damageRoll.evaluate()
        const damageRollToolTip = new Handlebars.SafeString(await damageRoll.getTooltip())
        damageRoll.options = {
          type: dialogContext.type,
          label: dialogContext.label,
          actorId: dialogContext.actor.id,
          damageRollToolTip,
          ...options,
        }
        rolls.push(damageRoll)
      }
    } else if (dialogContext.type === "damage") {
      const formula = `${rollContext.formulaDamage}`
      const roll = new this(formula, dialogContext.actor.getRollData())
      await roll.evaluate()

      const toolTip = new Handlebars.SafeString(await roll.getTooltip())
      roll.options = {
        type: dialogContext.type,
        label: dialogContext.label,
        actorId: dialogContext.actor.id,
        toolTip,
        ...options,
      }
      rolls.push(roll)
    }

    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`COAttackRoll - rolls`), rolls)
    return rolls
  }

  async _getChatCardData(flavor, isPrivate) {
    return {
      actorId: this.options.actorId,
      label: this.options.label,
      formula: isPrivate ? "???" : this.formula,
      showDifficulty: this.options.showDifficulty,
      difficulty: this.options.difficulty,
      isCritical: this.options.isCritical,
      isFumble: this.options.isFumble,
      isSuccess: this.options.isSuccess,
      isFailure: !this.options.isSuccess,
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
      user: game.user.id,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      toolTip: this.options.toolTip,
    }
  }
}
