import { ITEM_TYPE, OPEN_TYPE } from "../../system/constants.mjs";
import CoBaseActorSheet from "./base-actor-sheet.mjs";
import { Action } from "../../system/actions.mjs";
import { Log } from "../../utils/log.mjs";

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
      context.visibleActions = this.actor.visibleActions;      
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
    html.find(".path-delete").click(this._onDeletePath.bind(this));
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
   * For capacity, open the embededd item
   * @param event
   * @private
   */
  async _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const itemType = li.data("itemType");
    const id = li.data("itemId");

    switch (itemType) {
       case ITEM_TYPE.CAPACITY:
         {       
           let document = this.actor.items.get(id);
           return document.sheet.render(true);
         }
         break;
     }
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
      const itemType = li.data("itemType")
      if (itemType == "path") this._onDeletePath(event);
      else if (itemType == "capacity") this._onDeleteCapacity(event);
      else this.actor.deleteEmbeddedDocuments("Item",[itemId]);
    }

   /**
   * @description Delete the selected path
   * @param event
   * @private
   */
    async _onDeletePath(event) {
      event.preventDefault();
      const li = $(event.currentTarget).parents(".item");
      const pathId = li.data("itemId");

      // Delete linked capacities
      const capacitiesId = this.actor.items.get(pathId).system.capacities;
      this.actor.deleteEmbeddedDocuments("Item",capacitiesId);

      this.actor.deleteEmbeddedDocuments("Item",[pathId]);
    }

   /**
   * @description Delete the selected capacity
   * @param event
   * @private
   */
     async _onDeleteCapacity(event) {
      event.preventDefault();
      const li = $(event.currentTarget).parents(".item");
      const capacityId = li.data("itemId");

      this.actor.deleteEmbeddedDocuments("Item",[capacityId]);

      // Remove the capacity from the capacities list of the linked Path
      const capacity = this.actor.items.get(capacityId);
      const pathId = capacity.system.path;
      if (pathId != null) {
        let updatedCapacitiesIds = this.actor.items.get(pathId).system.capacities.filter(id => id !== capacityId);
        const updateData = {"_id" : pathId, "system.capacities": updatedCapacitiesIds};
        await this.actor.updateEmbeddedDocuments("Item", [updateData]);     
      }
      //const capacitiesId = this.actor.items.get(pathId).system.capacities;
      //this.actor.deleteEmbeddedDocuments("Item",capacitiesId);
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

  /**
   * @description The capacities in the path is a list of uui, on the drop, the real capacities must be created as embedded items
   * @param {*} item the Path dropped
   * @returns a path and his capacities
   */
  async _onDropPathItem(item) {
     let itemData = item.toObject();

     // Create the path
     itemData = itemData instanceof Array ? itemData : [itemData];
     const newPath = await this.actor.createEmbeddedDocuments("Item", itemData);
     console.log('newPath created', newPath);

     let updatedCapacitiesIds = [];

     for (const capacity of item.system.capacities) {
      let capa = await fromUuid(capacity);

      // item is null if the item has been deleted in the compendium
      if (capa != null) {
        // capa.system.source = newPath._id;
        
        let capaData = capa.toObject();
        capaData.system.path = newPath[0].id;
        // Create the embedded capacity
        const newCapa = await this.actor.createEmbeddedDocuments("Item", [capaData]);
      
        updatedCapacitiesIds.push(newCapa[0].id);
        
        // modification de la source des actions
        //let newActions = Object.values(foundry.utils.deepClone(capa.system.actions)).map(m => new Action(m.id, m.indice, m.type, m.img, m.label, m.chatFlavor, m.properties.visible, m.properties.enabled, m.properties.activable, m.conditions, m.modifiers, m.resolvers)); 
        //capa.system.actions = newActions;
      }
    }
    
     // Update the capacities of the path with id of created path
     const updateData = {"_id" : newPath[0].id, "system.capacities": updatedCapacitiesIds};
     await this.actor.updateEmbeddedDocuments("Item", [updateData]);     
  }     

  /**
   * @description Handle the drop of a single capacity on the actor
   * @param {*} item 
   */
  async _onDropCapacityItem(item) {
     let itemData = item.toObject();

     // Enable the capacity
     itemData.system.properties.enabled = true;
     itemData = itemData instanceof Array ? itemData : [itemData];
     const created = await this.actor.createEmbeddedDocuments("Item", itemData);    
     Log.info('Drop capacity created : ', created);

     // Create an array of actions
     // Update the source of all actions with the id of the new embedded capacity created
     // All actions are now enabled
     let newActions = Object.values(foundry.utils.deepClone(created[0].system.actions)).map(m => new Action(m.source, m.indice, m.type, m.img, m.label, m.chatFlavor, true, m.properties.activable, m.properties.enabled, m.properties.temporary, m.conditions, m.modifiers, m.resolvers)); 
     newActions.forEach(action => {
        action.updateSource(created[0].id);
     });

     const updateData = {"_id" : created[0].id, "system.actions": newActions};

     await this.actor.updateEmbeddedDocuments("Item", [updateData]);
  }
}
