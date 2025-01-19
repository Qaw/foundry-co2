export class CoSkillRollDialog extends Dialog {
  constructor(skillRoll, html, options) {
    options.classes.push("skillroll")
    options.width = 500

    let conf = {
      title: skillRoll.label,
      content: html,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CO.ui.cancel"),
          callback: () => {
            this.close()
          },
        },
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CO.ui.submit"),
          callback: async (html) => {
            const dice = html.find("#dice").val()
            const difficulty = html.find("#difficulty").val()
            const critrange = html.find("input#critrange").val()
            const carac = html.find("input#carac").val()
            const bonus = html.find("input#bonus").val()
            const malus = html.find("input#malus").val()
            const totalSkillBonuses = html.find("input#totalSkillBonuses").val()
            let roll = await this.skillRoll.roll(this.skillRoll.label, dice, carac, bonus, malus, totalSkillBonuses, difficulty, critrange)
            await this.skillRoll.chat(roll)
          },
        },
      },
      default: "submit",
    }

    super(conf, options)
    this.skillRoll = skillRoll
  }

  static async create(skillRoll, dialogTemplateData) {
    let options = { classes: ["co", "dialog"], height: "fit-content", "z-index": 99999 }
    let html = await renderTemplate("systems/co/templates/dialogs/skillcheck-dialog.hbs", dialogTemplateData)

    return new CoSkillRollDialog(skillRoll, html, options)
  }

  activateListeners(html) {
    super.activateListeners(html)
    html.find(".bonus-item").click(this._onToggleCheckSkillBonus.bind(this))
    html.find(".bonus-item").contextmenu(this._onContextBonusItem.bind(this))
    // Html.find(".bonus-item").mouseover(this._onHoverBonusItem.bind(this));
  }

  _onToggleCheckSkillBonus(event) {
    // Let value = event.currentTarget.dataset.value;
    let item = event.currentTarget.closest(".bonus-item")
    item.classList.toggle("checked")
    let total = this._calculateTotalSkillBonus(event)
    $("#totalSkillBonuses")[0].value = total
  }

  _onContextBonusItem(event) {
    let value = event.currentTarget.dataset.description
    console.log(`Skill description : ${value}`)
    let html = $(event.currentTarget).parents(".skillBonuses")
    let total = this._calculateTotalSkillBonus(html[0])
    $("#totalSkillBonuses")[0].value = total
  }

  _onHoverBonusItem(event) {
    // SHOW HTML TOOLTIP
  }

  _calculateTotalSkillBonus(event) {
    let parent = event.currentTarget.closest(".skill-bonuses")
    const skillBonuses = Array.from(parent.querySelectorAll(".bonus-item.checked"))
    let total = skillBonuses.reduce((acc, curr) => acc + parseInt(curr.dataset.value), 0)
    return total
  }
}

export class CoAttackRollDialog extends Dialog {
  constructor(attackRoll, html, options) {
    options.classes.push("attackRoll")
    options.width = 500

    let conf = {
      title: attackRoll.label,
      content: html,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CO.ui.cancel"),
          callback: () => {
            this.close()
          },
        },
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CO.ui.submit"),
          callback: async (html) => {
            const dice = html.find("#dice").val()
            const formulaAttack = html.find("#formulaAttack").val()
            const formulaDamage = html.find("#formulaDamage").val()
            const critrange = html.find("input#critrange").val()
            const difficulty = html.find("#difficulty").val()

            if (options.type === "attack") {
              let rollAttack = await this.attackRoll.rollAttack(attackRoll.label, dice, formulaAttack, formulaDamage, difficulty, critrange)
              await this.attackRoll.chat(rollAttack, "attack")

              if (game.settings.get("co", "useComboRolls")) {
                let damageRoll = await this.attackRoll.rollDamage(attackRoll.label, formulaDamage)
                await this.attackRoll.chat(damageRoll, "damage")
              }
            }

            if (options.type === "damage") {
              let rollDamage = await this.attackRoll.rollDamage(attackRoll.label, formulaDamage)
              await this.attackRoll.chat(rollDamage, "damage")
            }
          },
        },
      },
      default: "submit",
    }

    super(conf, options)
    this.attackRoll = attackRoll
  }

  static async create(attackRoll, dialogTemplateData) {
    let options = { classes: ["co", "dialog"], height: "fit-content", "z-index": 99999, type: dialogTemplateData.type }
    let html = await renderTemplate("systems/co/templates/dialogs/attack-dialog.hbs", dialogTemplateData)

    return new CoAttackRollDialog(attackRoll, html, options)
  }
}
