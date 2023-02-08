import { ITEM_TYPE, OPEN_TYPE } from "../../system/constants.mjs";
import CoBaseActorSheet from "./base-actor-sheet.mjs";
import { Action } from "../../system/actions.mjs";

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
      context.paths = this.actor.paths;
      context.profile = this.actor.profile;
      context.capacities = this.actor.capacities;
      context.features = this.actor.features;
      context.actions = this.actor.actions;
      // context.weapons = this.actor.weapons;
      // context.armors = this.actor.armors;
      // context.shields = this.actor.shields;
      context.inventory = {
        categories : {
          weapons : this.actor.weapons,
          armors : this.actor.armors,
          shields : this.actor.shields
        }
      }
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

    html.find(".toggle-action").click(this._onUseAction.bind(this));  
  }

  /**
   * 
   * @param {*} event 
   */
  _onUseAction(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const action = dataset.action;
    const source = dataset.source;
    const indice = dataset.indice;

    if (action == "activate") {
      this.actor.activateAction(true, source, indice);
    }
    else if (action == "unactivate") {
      this.actor.activateAction(false, source, indice);
    }
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
      this.actor.deleteEmbeddedDocuments("Item",[itemId]);
    }

    /** @inheritdoc */
    async _onDrop(event) {
      const data = TextEditor.getDragEventData(event);
      const actor = this.actor;
 
      /**
       * A hook event that fires when some useful data is dropped onto an ItemSheet.
       * @function dropActorSheetData
       * @memberof hookEvents
       * @param {Item} item      The Item
       * @param {ItemSheet} sheet The ItemSheet application
       * @param {object} data      The data that has been dropped onto the sheet
       */
      const allowed = Hooks.call("dropActorSheetData", actor, this, data);
      if (allowed === false) return;
 
      // Handle different data types
      switch (data.type) {
          case "Actor":
              return;
          case "Item":
              return this._onDropItem(event, data);
          case "Folder":
              return;
      }
  }

 /**
  * @param {DragEvent} event            The concluding DragEvent which contains drop data
  * @param {object} data                The data transfer extracted from the event
  * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
  * @protected
  */
  async _onDropItem(event, data) {
     event.preventDefault();
      if (!this.actor.isOwner) return false;
      const item = await Item.implementation.fromDropData(data);
      //const itemData = item.toObject();
 
      // Handle item sorting within the same Actor
      // if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);
 
      switch (item.type) {
         case ITEM_TYPE.EQUIPMENT:
             return this._onDropEquipmentItem(item);
         case ITEM_TYPE.FEATURE:
             return this._onDropFeatureItem(item);
         case ITEM_TYPE.PROFILE:
             return this._onDropProfileItem(item);
         case ITEM_TYPE.PATH:
             return this._onDropPathItem(item);
          case ITEM_TYPE.CAPACITY:
             return this._onDropCapacityItem(item);
          default:
             return false;
      }
  }

  _onDropEquipmentItem(item) {
     let itemData = item.toObject();
     itemData = itemData instanceof Array ? itemData : [itemData];
     return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  _onDropFeatureItem(item) {
     let itemData = item.toObject();
     itemData = itemData instanceof Array ? itemData : [itemData];
     return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  _onDropProfileItem(item) {
     let itemData = item.toObject();
     itemData = itemData instanceof Array ? itemData : [itemData];
     return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  _onDropPathItem(item) {
     let itemData = item.toObject();
     itemData = itemData instanceof Array ? itemData : [itemData];
     return this.actor.createEmbeddedDocuments("Item", itemData);
  }     

  async _onDropCapacityItem(item) {
     let itemData = item.toObject();

     // Change the source of all actions
     itemData = itemData instanceof Array ? itemData : [itemData];
     //return this.actor.createEmbeddedDocuments("Item", itemData);
     const created = await this.actor.createEmbeddedDocuments("Item", itemData);
     
     console.log('Drop capacity created : ', created);

     let newActions = Object.values(foundry.utils.deepClone(created[0].system.actions)).map(m => new Action(m.source, m.indice, m.type, m.img, m.label, m.chatFlavor, m.properties.visible, m.properties.enabled, m.properties.activable, m.conditions, m.modifiers, m.resolvers)); 
     newActions.forEach(action => {
        action.updateSource(created[0].id);
     });

     const updateData = {"_id" : created[0].id, "system.actions": newActions};

     await this.actor.updateEmbeddedDocuments("Item", [updateData]);

  }
}
