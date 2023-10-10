import { CoSkillCheck } from "../../system/roll.mjs";
import { CoChat } from "../../ui/chat.mjs";

export default class CoBaseActorSheet extends ActorSheet {
  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.config = game.co.config;
    context.debugMode = game.settings.get("co", "debugMode");
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".section-toggle").click(this._onSectionToggle.bind(this));
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));
    html.find(".item-chat.chat").click(this._onSendToChat.bind(this));
    html.find(".item-create").click(this._onItemCreate.bind(this));
  }

  /** @inheritDoc */
  _onDragStart(event) {
    super._onDragStart(event);
  }

  /**
   * @description
   * @param {*} event
   */
  _onSectionToggle(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents().next(".foldable");
    li.slideToggle("fast");
    return true;
  }

  /**
   * @description Manage the lock/unlock button on the sheet
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault();
    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.actor.sheet.render(true);
  }

  /**
   * @description Send the item details to the chat
   * @param {*} event
   */
  async _onSendToChat(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const chatType = dataset.chatType;
    console.log("send to chat with type", chatType);

    let id;
    let indice;
    if (chatType === "item") {
      id = $(event.currentTarget).parents(".item").data("itemId");
    } else if (chatType === "action") {
      id = $(event.currentTarget).data("source");
      indice = $(event.currentTarget).data("indice");
    }
    console.log("Item : ", id);
    let item = this.actor.items.get(id);
    let itemChatData = chatType === "item" ? item.getChatData(null) : item.getChatData(indice);

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
      .create();
  }

  /**
   * @description Create a new embedded item
   * @param {*} event
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;

    const itemData = {
      type: type,
      system: foundry.utils.expandObject({ ...header.dataset }),
    };
    delete itemData.system.type;

    switch (type) {
      case "equipment":
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Equipement" });
        let subtype;
        switch (itemData.system.subtype) {
          case "armors":
            subtype = "ARMOR";
            break;
          case "shields":
            subtype = "SHIELD";
            break;
          case "weapons":
            subtype = "WEAPON";
            break;
          case "misc":
            subtype = "MISC";
            break;
        }
        itemData.system.subtype = subtype;
        break;
      case "capacity":
        itemData.name = game.i18n.format("CO.ui.newItem", { item: "Capacité" });
        itemData.system.learned = true;
        break;
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   *
   * @param {*} event
   */
  _onRoll(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollType = dataset.rollType;
    const rolling = dataset.rolling;

    // console.debug(game.co.log(rolling));

    switch (rollType) {
      case "skillcheck":
        new CoSkillCheck(this.actor).init(rolling);
      case "combatcheck":
        break;
    }
    // return this.actor.skillCheck(event, this.actor);
    // return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
}
