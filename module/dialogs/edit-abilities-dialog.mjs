import {CoSkillRollDialog} from "./dialog-roll.mjs";

export class CoEditAbilitiesDialog extends Dialog {

  static async init(actor) {
    let dialogTemplateData = {
      actor: actor
    };
    let options = { classes: ["co", "dialog", "edit-abilities-dialog"], width:750, height: "fit-content", "z-index": 99999, type: "editAbilities" };
    let html = await renderTemplate("systems/co/templates/dialogs/edit-abilities-dialog.hbs", dialogTemplateData);
    let rollDialog = new CoEditAbilitiesDialog(actor, html, options);
    return rollDialog.render(true);
  }
  constructor(actor, html, options) {
    let conf = {
      title: game.i18n.localize("CO.ui.editYourAbilities"),
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
            // const dice = html.find("#dice").val();
            // const formulaAttack = html.find("#formulaAttack").val();
            // const formulaDamage = html.find("#formulaDamage").val();
            // const critrange = html.find("input#critrange").val();
            // const difficulty = html.find("#difficulty").val();
            //
            // if (options.type === "attack") {
            //   let rollAttack = await this.attackRoll.rollAttack(attackRoll.label, dice, formulaAttack, formulaDamage, difficulty, critrange);
            //   await this.attackRoll.chat(rollAttack, "attack");
            //
            //   if (game.settings.get("co", "useComboRolls")){
            //     let damageRoll = await this.attackRoll.rollDamage(attackRoll.label, formulaDamage);
            //     await this.attackRoll.chat(damageRoll, "damage");
            //   }
            // }
            // if (options.type === "damage") {
            //   let rollDamage = await this.attackRoll.rollDamage(attackRoll.label, formulaDamage);
            //   await this.attackRoll.chat(rollDamage, "damage");
            // }
          }
        }
      },
      default: "submit"
    };
    super(conf, options);
    this.actor = actor;
  }
}