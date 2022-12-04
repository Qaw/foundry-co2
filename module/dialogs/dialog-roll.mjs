export class CoSkillRollDialog extends Dialog {
  constructor(skillRoll, html, options) {
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

    html.find(".skillcheck").click(this._onCheckSkillBonus.bind(this));
  }

  _onCheckSkillBonus(event) {
    let checked = event.currentTarget.checked;
    let value = event.currentTarget.dataset.value;
    console.log("Skill Check : " + value);
  }
}
