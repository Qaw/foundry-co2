import { CoSkillCheck } from "../../system/roll.mjs"
import CoChat from "../../chat.mjs"
import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options)
    context.debugMode = game.settings.get("co", "debugMode")
    context.system = this.actor.system
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
    context.inventory = this.actor.inventory
    context.unlocked = this.actor.isUnlocked
    context.locked = !this.actor.isUnlocked
    // Select options
    context.choiceMoveUnit = SYSTEM.MOVEMENT_UNIT

    if (CONFIG.debug.co?.sheets) console.debug(Utils.log(`CoBaseActorSheet - context`), context)
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
   * Manage the toggle of the sections
   * @param {Event} event
   */
  _onSectionToggle(event) {
    event.preventDefault()
    const li = $(event.currentTarget).parents().next(".foldable")
    li.slideToggle("fast")
    return true
  }

  /**
   * Manage the lock/unlock button on the sheet
   * @param {Event} event
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
   * @param {Event} event
   */
  async _onSendToChat(event) {
    event.preventDefault()
    // Dataset has tooltip, chatType and if it's an action there are also indice and source
    const dataset = event.currentTarget.dataset
    const chatType = dataset.chatType

    let item
    let id
    let indice = null
    if (chatType === "item" || chatType === "loot") {
      id = $(event.currentTarget).parents(".item").data("itemId")
      item = this.actor.items.get(id)
    } else if (chatType === "action") {
      item = await fromUuid(dataset.source)
      indice = dataset.indice
    }

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
   * @param {Event} event
   */
  _onItemCreate(event) {
    event.preventDefault()
    const target = event.currentTarget
    const type = target.dataset.type

    const itemData = {
      type: type,
      system: foundry.utils.expandObject({ ...target.dataset }),
    }
    delete itemData.system.type

    switch (type) {
      case SYSTEM.ITEM_TYPE.equipment.id:
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Equipement" })
        let subtype
        switch (itemData.system.subtype) {
          case "armors":
            subtype = SYSTEM.EQUIPMENT_SUBTYPES.armor.id
            break
          case "shields":
            subtype = SYSTEM.EQUIPMENT_SUBTYPES.shield.id
            break
          case "weapons":
            subtype = SYSTEM.EQUIPMENT_SUBTYPES.weapon.id
            break
          case "misc":
            subtype = SYSTEM.EQUIPMENT_SUBTYPES.misc.id
            break
        }
        itemData.system.subtype = subtype
        break
      case SYSTEM.ITEM_TYPE.capacity.id:
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Capacité" })
        itemData.system.learned = true
        break
      case SYSTEM.ITEM_TYPE.attack.id:
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Attaque" })
        itemData.system.subtype = "MELEE"
        itemData.system.learned = true
        break
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData])
  }

  _onRoll(event) {
    const dataset = event.currentTarget.dataset
    const type = dataset.rollType
    const target = dataset.rollTarget

    switch (type) {
      case "skillcheck":
        this.actor.rollSkill(target)
      case "combatcheck":
        break
    }
    // Return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
}
