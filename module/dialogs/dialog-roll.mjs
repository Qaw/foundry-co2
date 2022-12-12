export class CoSkillRollDialog extends Dialog {
  constructor(skillRoll, html, options) {

    options.classes.push("skillroll");
    options.width = 500;

    let conf = {
      title: skillRoll.label,
      content: html,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CO.ui.cancel"),
          callback: () => { this.close() }
        },
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CO.ui.submit"),
          callback: async (html) => {
            const dice = html.find("#dice").val();
            const difficulty = html.find("#difficulty").val();
            const critrange = html.find("input#critrange").val();
            const mod = html.find("input#mod").val();
            const bonus = html.find("input#bonus").val();
            const malus = html.find("input#malus").val();
            const totalSkillBonuses = html.find("input#totalSkillBonuses").val();
            let roll = await this.skillRoll.roll(this.skillRoll.label, dice, mod, bonus, malus, totalSkillBonuses, difficulty, critrange);
            await this.skillRoll.chat(roll);
          }
        }
      },
      default: "submit"
    };

    super(conf, options);
    this.skillRoll = skillRoll;
  }

  static async create(skillRoll, dialogTemplateData) {
    let options = { classes: ["co", "dialog"], height: "fit-content", "z-index": 99999 };
    let html = await renderTemplate("systems/co/templates/dialogs/skillcheck-dialog.hbs", dialogTemplateData);

    return new CoSkillRollDialog(skillRoll, html, options);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".bonus-item").click(this._onToggleCheckSkillBonus.bind(this));
    html.find(".bonus-item").contextmenu(this._onContextBonusItem.bind(this));
    // html.find(".bonus-item").mouseover(this._onHoverBonusItem.bind(this));
  }

  _onToggleCheckSkillBonus(event) {
    // let value = event.currentTarget.dataset.value;
    let item = event.currentTarget.closest('.bonus-item');
    item.classList.toggle("checked");
    let total = this._calculateTotalSkillBonus(event);
    $('#totalSkillBonuses')[0].value = total;
  }

  _onContextBonusItem(event) {
    let value = event.currentTarget.dataset.description;
    console.log("Skill description : " + value);
    let html = $(event.currentTarget).parents('.skillBonuses');
    let total = this._calculateTotalSkillBonus(html[0]);
    $('#totalSkillBonuses')[0].value = total;
  }

  _onHoverBonusItem(event) {
    // SHOW HTML TOOLTIP
  }

  _calculateTotalSkillBonus(event) {
    let parent = event.currentTarget.closest('.skill-bonuses')
    const skillBonuses = Array.from(parent.querySelectorAll(".bonus-item.checked"));
    let total = skillBonuses.reduce((acc, curr) => acc + parseInt(curr.dataset.value), 0);
    return total;
  }
}
