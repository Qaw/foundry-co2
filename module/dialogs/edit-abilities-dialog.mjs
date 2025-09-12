export class CoEditAbilitiesDialog extends foundry.applications.api.DialogV2 {
  /** Override */
  static DEFAULT_OPTIONS = {
    classes: ["co", "edit-abilities-dialog"],
    position: {
      width: 1000,
      height: 415,
    },
    actions: {
      reset: CoEditAbilitiesDialog.#onReset,
      toggleSuperior: CoEditAbilitiesDialog.#onToggleSuperior,
    },
  }

  static DISTRIBUTION_MODES = {
    polyvalent: [2, 2, 2, 1, 1, 0, -1],
    expert: [3, 2, 1, 1, 0, 0, -1],
    specialist: [4, 2, 1, 0, 0, -1, -1],
    libre: [],
  }

  constructor({ actor }) {
    super()
    this.actor = actor
    this.mode = "libre"
    this.assignedIds = {}
  }

  /**
   * Initialise les options de la boîte de dialogue.
   * @param {object} [options={}]
   * @returns {object}
   */
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

  /**
   * Construit le HTML à partir du template Handlebars.
   * @param {object} context
   * @param {object} options
   * @returns {Promise<string>}
   */
  _renderHTML(context, options) {
    const assigned = Object.values(this.assignedIds)

    const values = this.constructor.DISTRIBUTION_MODES[this.mode].map((val, index) => ({
      id: `v${index}`,
      value: val,
      used: assigned.includes(`v${index}`),
    }))
    const abilities = this.actor.system.abilities
    return foundry.applications.handlebars.renderTemplate("systems/co/templates/dialogs/edit-abilities-dialog.hbs", {
      actor: this.actor,
      abilities,
      mode: this.mode,
      values,
    })
  }

  /**
   * Injecte le HTML rendu dans le DOM et attache les listeners.
   * @param {string} result
   * @param {HTMLElement} content
   * @param {object} options
   */
  _replaceHTML(result, content, options) {
    content.innerHTML = result
    $(this.element).find("input.ability-base").change(this._onChangeAbilityBase.bind(this))
    $(this.element).find("input.ability-bonus").change(this._onChangeAbilityBonus.bind(this))
    $(this.element).find("#distribution-mode").change(this._onChangeDistributionMode.bind(this))
    // Drag source
    content.querySelectorAll(".draggable-value").forEach((el) => {
      el.addEventListener("dragstart", this._onDragValue.bind(this))
    })

    // Drop targets
    content.querySelectorAll(".dropzone").forEach((el) => {
      el.addEventListener("dragover", (ev) => ev.preventDefault())
      el.addEventListener("drop", this._onDropValue.bind(this))
    })
  }

  async _onChangeAbilityBase(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const raw = event.currentTarget.value
    const value = raw === "" ? null : Number(raw)
    const { actor } = this
    await actor.update({ [`system.abilities.${ability}.base`]: value })
    this.render(true, { focus: true })
  }

  async _onChangeAbilityBonus(event) {
    const ability = $(event.currentTarget).attr("data-ability")
    const raw = event.currentTarget.value
    const value = raw === "" ? null : parseInt(raw)
    const { actor } = this
    await actor.update({ [`system.abilities.${ability}.bonuses.sheet`]: value })
    this.render(true, { focus: true })
  }

  static async #onToggleSuperior(event, target) {
    const ability = $(target).attr("data-ability")
    const { actor } = this
    const value = !actor.system.abilities[ability].superior
    await actor.update({ [`system.abilities.${ability}.superior`]: value })
    this.render(true)
  }

  _onDragValue(event) {
    const value = event.currentTarget.dataset.value
    const id = event.currentTarget.dataset.id
    const payload = JSON.stringify({ id, value })
    event.dataTransfer.setData("application/x-co-value", payload)
  }

  async _onDropValue(event) {
    event.preventDefault()
    const ability = event.currentTarget.dataset.ability

    const raw = event.dataTransfer.getData("application/x-co-value")
    if (!raw) return

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      return ui.notifications.warn("Format de valeur incorrect.")
    }

    const { id, value } = parsed
    if (!id) {
      console.warn("ID manquant dans l’objet drag-drop :", parsed)
    }

    // Trouver si cette valeur est déjà utilisée dans une autre caractéristique
    const previousEntry = Object.entries(this.assignedIds).find(([key, assignedId]) => assignedId === id)

    if (previousEntry) {
      const [previousAbility] = previousEntry

      // Réinitialise l’ancienne case
      await this.actor.update({ [`system.abilities.${previousAbility}.base`]: null })

      // Supprime l'ancien lien
      delete this.assignedIds[previousAbility]
    }

    await this.actor.update({ [`system.abilities.${ability}.base`]: Number(value) })
    this.assignedIds[ability] = id
    this.render(true)
  }

  async _onChangeDistributionMode(event) {
    this.mode = event.target.value
    this.assignedIds = {}

    // Réinitialiser les caractéristiques si mode ≠ libre
    if (this.mode !== "libre") {
      const reset = {}
      for (const [id, _] of Object.entries(this.actor.system.abilities)) {
        reset[`system.abilities.${id}.base`] = null
      }
      await this.actor.update(reset)
    }

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
