import { ITEM_TYPE, OPEN_TYPE } from "../../system/constants.mjs";
import CoBaseActorSheet from "./base-actor-sheet.mjs";

export default class CoCharacterSheet extends CoBaseActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 600,
      width: 800,
      template: "systems/co/templates/actors/character-sheet.hbs",
      classes: ["co", "sheet", "actor", "character"],      
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.system = this.actor.system;
    context.abilities = this.actor.system.abilities;
    context.combat = this.actor.system.combat;
    context.attributes = this.actor.system.attributes;
    context.resources = this.actor.system.resources;
    context.details = this.actor.system.details;
    // context.paths = context.items.filter((item) => item.type === ITEM_TYPE.PATH);
    // context.profile = context.items.find((item) => item.type === ITEM_TYPE.PROFILE);
    // context.capacities = context.items.filter((item) => item.type === ITEM_TYPE.CAPACITY);
    // context.traits = context.items.filter((item) => item.type === ITEM_TYPE.TRAIT);
    // context.features = context.items.filter((item) => item.type === ITEM_TYPE.FEATURE);
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // html.find(".capacity-checked").click(this._onUncheckCapacity.bind(this));
    // html.find(".capacity-unchecked").click(this._onCheckCapacity.bind(this));
    html.find(".item-edit").click(this._onEditItem.bind(this));
    html.find(".item-delete").click(this._onDeleteItem.bind(this));
    html.find(".rollable").click(this._onRoll.bind(this));
  }

  /**
   * 
   * @param {*} event 
   * @private
   */
  // _onUncheckCapacity(event) {
  //   this._toggleCapacity(event, false);
  // }

  /**
   * 
   * @param {*} event 
   * @private
   */
  // _onCheckCapacity(event) {
  //   this._toggleCapacity(event, true);
  // }

  /**
   * @description Select or unselect the capacity in the path view
   * @param {*} event
   * @param {Boolean} status the target status of the capacity, true if selected, false elsewhere
   * @private
   */
  // _toggleCapacity(event, status) {
  //   event.preventDefault();
  //   const li = $(event.currentTarget).parents(".capacity");
  //   const pathId = li.data("pathId");
  //   const capacityKey = li.data("key");
  //
  //   this.actor.toggleCapacity(pathId, capacityKey, status);
  // }

  /**
   * @description Open the item sheet
   * For capacity, open the source of the item or the embededd item depending of OPEN_TYPE value
   * @param event
   * @private
   */
  async _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    // const itemType = li.data("itemType");
    // const openType = li.data("openType");

    // switch (itemType) {
    //   case ITEM_TYPE.CAPACITY:
    //     {
    //       if (openType == OPEN_TYPE.SOURCE) {
    //         const source = li.data("itemSource");
    //         let document = await fromUuid(source);
    //         return document.sheet.render(true);
    //       }
    //       else if (openType == OPEN_TYPE.EMBEDDED_ID){
    //         const id = li.data("itemId");
    //         let document = this.actor.items.get(id);
    //         return document.sheet.render(true);
    //       }
    //
    //     }
    //     break;
    // }
  }

  /**
   * @description Delete the selected item
   * @param event
   * @private
   */
     async _onDeleteItem(event) {
      event.preventDefault();
      const li = $(event.currentTarget).parents(".item");
      const itemId = li.data("itemId");
      this.actor.deleteItem(itemId);
    }
}
