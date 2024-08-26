export class CoEditAbilitiesDialog extends Application {
  constructor(actor) {
    super()
    this.actor = actor
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      classes: ["co", "dialog", "edit-abilities-dialog"],
      title: game.i18n.localize("CO.ui.editYourAbilities"),
      template: "systems/co/templates/dialogs/edit-abilities-dialog.hbs",
      width: "auto",
      height: "fit-content",
    }
  }

  get id() {
    return `edit-abilities-${this.actor.id}`
  }

  async getData(options = {}) {
    const { actor } = this
    return {
      ...(await super.getData(options)),
      actor,
    }
  }

  activateListeners(html) {
    super.activateListeners(html)
    html.find("button[data-action=superior]").click(this._onToggleSuperiorAbility.bind(this))
    html.find("button[name=reset-ability-scores]").click(this._onResetAbilityScores.bind(this))
    html.find("input.ability-base").change(this._onChangeAbilityBase.bind(this))
    html.find("input.ability-bonus").change(this._onChangeAbilityBonus.bind(this))
  }

  _onChangeAbilityBase(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const value = $(event.currentTarget).val()
    const { actor } = this
    return actor.update({ [`system.abilities.${ability}.base`]: value }).then(() => this.render(true, { focus: true }))
  }

  _onChangeAbilityBonus(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const value = $(event.currentTarget).val()
    const { actor } = this
    return actor.update({ [`system.abilities.${ability}.bonuses.sheet`]: value }).then(() => this.render(true, { focus: true }))
  }

  async _onToggleSuperiorAbility(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const { actor } = this
    const value = !actor.system.abilities[ability].superior
    return actor.update({ [`system.abilities.${ability}.superior`]: value }).then(() => this.render(true))
  }

  async _onResetAbilityScores(event) {
    const { actor } = this
    // Construct the Roll instance
    let r = new Roll("{4d6kh3, 4d6kh3, 4d6kh3, 4d6kh3, 4d6kh3, 4d6kh3}")
    await r.roll({ async: true })
    const newAbilityScores = {
      str: { base: r.terms[0].results[0].result },
      dex: { base: r.terms[0].results[1].result },
      con: { base: r.terms[0].results[2].result },
      int: { base: r.terms[0].results[3].result },
      wis: { base: r.terms[0].results[4].result },
      cha: { base: r.terms[0].results[5].result },
    }
    r.toMessage({
      user: game.user.id,
      flavor: "Réinitialisation des caractéristiques",
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flags: { msgType: "damage" },
    })
    // Await r.evaluate();
    return actor.update({ "system.abilities": newAbilityScores }).then(() => this.render(true))
  }
}
