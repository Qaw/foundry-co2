import {CoSkillCheck} from "../../system/roll.mjs";
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
    html.find(".item-chat.chat").click(this._sendToChat.bind(this));
  }

  /**
   * Manage the lock/unlock button on the sheet
   *
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
   *
   * @param {*} event
   * @returns
   */
  _onSectionToggle(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents().next(".foldable");
    li.slideToggle("fast");
    return true;
  }

  /**
   * Send the item details to the chat
   * @param {*} event 
   */
  async _sendToChat(event) {
    event.preventDefault();
    //const li = $(event.currentTarget).parents().next(".foldable");
    const dataset = event.currentTarget.dataset;
    const chatType = dataset.chatType;
    console.log("send to chat with type", chatType);

    let id;
    let indice;
    if (chatType === "item") {
      id = $(event.currentTarget).parents(".item").data("itemId");
    }
    else if (chatType === "action") {
      id = $(event.currentTarget).data("source");
      indice = $(event.currentTarget).data("indice");
    }
    console.log('Item : ', id);
    let item = this.actor.items.get(id);
    let itemChatData = chatType === "item" ? item.chatData : item.getchatDataFromAction(indice);

    await new CoChat(this.actor)
          .withTemplate('systems/co/templates/chat/item-card.hbs')
          .withData({
              actorId: this.actor.id,
              id: itemChatData.id,
              name: itemChatData.name,
              img: itemChatData.img,
              description: itemChatData.description,
              actions: itemChatData.actions
          })
          .withWhisper(ChatMessage.getWhisperRecipients('GM').map((u) => u.id))
          .create();
  }

  _onRoll(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rollType = dataset.rollType;
    const rolling = dataset.rolling;

    // console.debug(game.co.log(rolling));
    
    switch(rollType){
      case "skillcheck" : new CoSkillCheck(this.actor).init(rolling);
      case "combatcheck" : break;
    }
    // return this.actor.skillCheck(event, this.actor);
    // return this.actor.dmgRoll(event, this.actor);
    // return this.actor.attackRoll(event, this.actor)
    // return this.actor.initRoll(event, this.actor)
  }
}
