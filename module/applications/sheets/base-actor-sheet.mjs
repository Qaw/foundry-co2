import { CoSkillCheck } from "../../system/roll.mjs"
import CoChat from "../../chat.mjs"

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options)
    context.config = game.co.config
    context.debugMode = game.settings.get("co", "debugMode")
    context.system = this.actor.system
    // Console.debug(game.co.log(this.actor.system.abilities));
    context.abilities = this.actor.system.abilities
    context.combat = this.actor.system.combat
    context.attributes = this.actor.system.attributes
    context.resources = this.actor.system.resources
    context.details = this.actor.system.details
    context.paths = this.actor.paths
    context.pathGroups = this.actor.pathGroups
    context.capacities = this.actor.capacities
    context.learnedCapacities = this.actor.learnedCapacities
    context.capacitiesOffPaths = this.actor.capacitiesOffPaths
    context.features = this.actor.features
    context.actions = this.actor.actions
    context.visibleActions = this.actor.visibleActions
    context.visibleActivableActions = this.actor.visibleActivableActions
    context.visibleNonActivableActions = this.actor.visibleNonActivableActions
    context.visibleActivableTemporaireActions = this.actor.visibleActivableTemporaireActions
    context.visibleNonActivableNonTemporaireActions = this.actor.visibleNonActivableNonTemporaireActions
    context.inventory = this.actor.inventory
    context.unlocked = this.actor.isUnlocked

    // Select options
    context.choiceMoveUnit = SYSTEM.MOVEMENT_UNIT
    return context
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)
    html.find(".section-toggle").click(this._onSectionToggle.bind(this))
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this))
    html.find(".item-chat.chat").click(this._onSendToChat.bind(this))
    html.find(".item-create").click(this._onItemCreate.bind(this))
  }

  /** @inheritDoc */
  _onDragStart(event) {
    super._onDragStart(event)
  }

  /**
   * @description
   * @param {*} event
   */
  _onSectionToggle(event) {
    event.preventDefault()
    const li = $(event.currentTarget).parents().next(".foldable")
    li.slideToggle("fast")
    return true
  }

  /**
   * Manage the lock/unlock button on the sheet
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault()
    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked")
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked")
    this.actor.sheet.render(true)
  }

  /**
   * Send the item details to the chat
   * Chat Type are :
   * - item : to display an item and all its actions
   * - action : to display the item and the action
   * - loot : to only display informations on the item
   * @param {*} event
   */
  async _onSendToChat(event) {
    event.preventDefault()
    const dataset = event.currentTarget.dataset
    const chatType = dataset.chatType

    let id
    let indice
    if (chatType === "item" || chatType === "loot") {
      id = $(event.currentTarget).parents(".item").data("itemId")
    } else if (chatType === "action") {
      id = $(event.currentTarget).data("source")
      indice = $(event.currentTarget).data("indice")
    }

    let item = this.actor.items.get(id)
    let itemChatData = item.getChatData(chatType, indice)

    await new CoChat(this.actor)
      .withTemplate("systems/co/templates/chat/item-card.hbs")
      .withData({
        actorId: this.actor.id,
        id: itemChatData.id,
        name: itemChatData.name,
        img: itemChatData.img,
        description: itemChatData.description,
        actions: itemChatData.actions,
      })
      .withWhisper(ChatMessage.getWhisperRecipients("GM").map((u) => u.id))
      .create()
  }

  /**
   * Create a new embedded item
   * @param {*} event
   */
  _onItemCreate(event) {
    event.preventDefault()
    const header = event.currentTarget
    const type = header.dataset.type

    const itemData = {
      type: type,
      system: foundry.utils.expandObject({ ...header.dataset }),
    }
    delete itemData.system.type

    switch (type) {
      case "equipment":
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Equipement" })
        let subtype
        switch (itemData.system.subtype) {
          case "armors":
            subtype = "ARMOR"
            break
          case "shields":
            subtype = "SHIELD"
            break
          case "weapons":
            subtype = "WEAPON"
            break
          case "misc":
            subtype = "MISC"
            break
        }
        itemData.system.subtype = subtype
        break
      case "capacity":
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Capacité" })
        itemData.system.learned = true
        break
      case "attack":
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Attaque" })
        itemData.system.subtype = "MELEE"
        itemData.system.learned = true
        break
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData])
  }

  /**
   *
   * @param {*} event
   */
  _onRoll(event) {
    const element = event.currentTarget
    const dataset = element.dataset
    const rollType = dataset.rollType
    const rolling = dataset.rolling

    // Console.debug(game.co.log(rolling));

    switch (rollType) {
      case "skillcheck":
        new CoSkillCheck(this.actor).init(rolling)
      case "combatcheck":
        break
    }
    // Return this.actor.skillCheck(event, this.actor);
    // return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
}
