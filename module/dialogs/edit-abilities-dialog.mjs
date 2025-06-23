export class CoEditAbilitiesDialog extends foundry.applications.api.DialogV2 {
  /** override */
  static DEFAULT_OPTIONS = {
    classes: ["co", "edit-abilities-dialog"],
    position: {
      width: 1000,
      height: 420,
    },
    actions: {
      reset: CoEditAbilitiesDialog.#onReset,
      toggleSuperior: CoEditAbilitiesDialog.#onToggleSuperior,
    }
  }

  constructor({ actor }) {
    super()
    this.actor = actor
  }

  /** override */
  _initializeApplicationOptions(options) {
    options.buttons = [
      {
        label: game.i18n.localize("CO.ui.close"),
        icon: "fas fa-solid fa-xmark",
        action: () => this.close(),
      },
    ]
    options = super._initializeApplicationOptions(options)
    options.window.title = game.i18n.localize("CO.ui.editYourAbilities")
    return options
  }

  /** override */
  _renderHTML(context, options) {
    return foundry.applications.handlebars.renderTemplate("systems/co/templates/dialogs/edit-abilities-dialog.hbs", this.actor)
  }

  /** @override */
  _replaceHTML(result, content, _options) {
    content.innerHTML = result
    $(this.element).find("input.ability-base").change(this._onChangeAbilityBase.bind(this))
    $(this.element).find("input.ability-bonus").change(this._onChangeAbilityBonus.bind(this))
  }

  async _onChangeAbilityBase(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const value = $(event.currentTarget).val()
    const { actor } = this
    const updates = await actor.update({ [`system.abilities.${ability}.base`]: value })
    this.render(true, { focus: true })
  }

  async _onChangeAbilityBonus(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const value = $(event.currentTarget).val()
    const { actor } = this
    const updates = await actor.update({ [`system.abilities.${ability}.bonuses.sheet`]: value })
    this.render(true, { focus: true })
  }

  static async #onToggleSuperior(event, target) {
    const ability = $(target).attr("data-ability")
    const { actor } = this
    const value = !actor.system.abilities[ability].superior
    const updates = await actor.update({ [`system.abilities.${ability}.superior`]: value })
    this.render(true)
  }

  // TODO Garder ou refaire ?
  static async #onReset() {
    const { actor } = this
    // Construct the Roll instance
    let r = new Roll("{1d4,1d4,1d4,1d4,1d4,1d4}")
    await r.roll()
    const newAbilityScores = {
      agi: { base: r.terms[0].results[0].result },
      con: { base: r.terms[0].results[1].result },
      for: { base: r.terms[0].results[2].result },
      per: { base: r.terms[0].results[3].result },
      cha: { base: r.terms[0].results[4].result },
      int: { base: r.terms[0].results[5].result },
      vol: { base: r.terms[0].results[5].result },
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
