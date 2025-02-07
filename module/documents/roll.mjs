import Utils from "../utils.mjs"
export class CORoll extends Roll {
  static ROLL_TYPE = "standard"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/roll-dialog.hbs"

  static CHAT_TEMPLATE = "systems/co/templates/chat/roll-card.hbs"

  static ROLL_CSS = ["co", "dialog", "roll"]

  static async prompt(dialogContext, options = {}) {
    const content = await renderTemplate(this.DIALOG_TEMPLATE, dialogContext)

    const rollContext = await foundry.applications.api.DialogV2.wait({
      window: { title: dialogContext.label },
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
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`Roll prompt - Callback`), event, button, dialog)
            const output = Array.from(button.form.elements).reduce((obj, input) => {
              if (input.name) obj[input.name] = input.value
              return obj
            }, {})
            if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`Roll prompt - Output`), output)
            /* 
            {
                "dice": "1d20",
                "carac": "+4",
                "critrange": "20",
                "bonus": "+0",
                "malus": "+0",
                "difficulty": "10",
                "totalSkillBonuses": "0"
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

    if (rollContext === null) return
    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`Roll - rollContext`), rollContext)

    const formula = `${rollContext.dice}${rollContext.carac}${rollContext.bonus}${rollContext.malus}+${rollContext.totalSkillBonuses}`
    const roll = new this(formula, dialogContext.actor.getRollData())
    await roll.evaluate()

    const result = roll.terms[0].results.find((r) => r.active).result
    const isCritical = result >= rollContext.critrange || result === 20
    const isFumble = result === 1
    const showDifficulty = true

    roll.options = {
      isCritical,
      isFumble,
      showDifficulty,
      ...options,
    }

    if (CONFIG.debug.co?.rolls) console.debug(Utils.log(`Roll - roll`), roll)
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

  async toMessage(messageData = {}, { rollMode, create = true } = {}) {

    super.toMessage(
      {
        showDifficulty: this.options.showDifficulty,
        isCritical: this.options.isCritical,
        isFumble: this.options.isFumble,
        ...messageData,
      },
      { rollMode: rollMode },
    )
  }
}

export class COSkillRoll extends CORoll {
  static ROLL_TYPE = "skill"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/skill-roll-dialog.hbs"

  static CHAT_TEMPLATE = "systems/co/templates/chat/skillcheck-card.hbs"

  static ROLL_CSS = ["co", "dialog", "skill-roll"]
}

export class COAttackRoll extends CORoll {
  static ROLL_TYPE = "attack"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/attack-roll-dialog.hbs"

  static ROLL_CSS = ["co", "dialog", "attack-roll"]
}

export class CODmgRoll extends CORoll {
  static ROLL_TYPE = "dmg"

  static DIALOG_TEMPLATE = "systems/co/templates/dialogs/dmg-roll-dialog.hbs"

  static ROLL_CSS = ["co", "dialog", "dmg-roll"]
}
