import CoBaseItemSheet from "./base-item-sheet.mjs";
import { Modifier } from "../../system/modifiers.mjs";
import { ITEM_TYPE } from "../../system/constants.mjs";

export default class CoItemSheet extends CoBaseItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 600,
            classes: ["co", "sheet", "item"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
        });
    }

    /** @override */
    get template() {
         return "systems/co/templates/items/item-sheet.hbs";
    }

    /** @inheritdoc */
     async _onDrop(event) {
         const data = TextEditor.getDragEventData(event);
         const item = this.item;
    
         /**
          * A hook event that fires when some useful data is dropped onto an ItemSheet.
          * @function dropActorSheetData
          * @memberof hookEvents
          * @param {Item} item      The Item
          * @param {ItemSheet} sheet The ItemSheet application
          * @param {object} data      The data that has been dropped onto the sheet
          */
         const allowed = Hooks.call("dropItemSheetData", item, this, data);
         if (allowed === false) return;
    
         // Handle different data types
         switch (data.type) {
             case "ActiveEffect":
                 return; //this._onDropActiveEffect(event, data);
             case "Actor":
                 return; //this._onDropActor(event, data);
             case "Item":
                 return this._onDropItem(event, data);
             case "Folder":
                 return; //this._onDropFolder(event, data);
         }
     }

    /**
     * @param {DragEvent} event            The concluding DragEvent which contains drop data
     * @param {object} data                The data transfer extracted from the event
     * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
     async _onDropItem(event, data) {
         if (!this.item.isOwner) return false;
         const item = await Item.implementation.fromDropData(data);
         //const itemData = item.toObject();
    
         // Handle item sorting within the same Actor
         // if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);
    
         // Create the owned item
         // return this._onDropItemCreate(itemData);
         switch (item.type) {
            case ITEM_TYPE.TRAIT:
                return this._onDropTraitItem(item);
            case ITEM_TYPE.PATH:
                 return;//this._onDropPathItem(event, itemData);
             case ITEM_TYPE.CAPACITY:
                 //return this._onDropCapacityItem(item);
             case ITEM_TYPE.PROFILE:
             default:
                 return false;
         }
     }
     
     _onDropTraitItem(item) {
        const itemData = item.toObject();
        itemData = itemData instanceof Array ? itemData : [itemData];
        return this.actor.createEmbeddedDocuments("Item", itemData);
     }

    /**
     *
     * @param {*} itemData
     * @param {String} uuid
     * @returns
     */
    // _onDropCapacityItem(item) {
    //     console.log("_onDropCapacityItem : ", item);
    //     const itemData = item.toObject();
    //
    //     if (this.item.type == "path") {
    //         if (this.item.hasCapacityBySource(itemData.flags.core.sourceId)) return;
    //         let system = foundry.utils.duplicate(this.item.system);
    //         system.capacities.push({
    //             source: item.uuid,
    //             key: item.system.key,
    //             name: itemData.name,
    //             img: itemData.img,
    //             description: itemData.system.description,
    //             selected: false
    //         });
    //         const rank = system.maxRank === null ? 1 : system.maxRank + 1;
    //         system.maxRank = rank;
    //
    //         this.item.update({system: system});
    //     }
    // }

    /**
     * Handle the final creation of dropped Item data on the Actor.
     * @param {object[]|object} itemData     The item data requested for creation
     * @returns {Promise<Item[]>}
     * @private
     */
    // async _onDropItemCreate(itemData) {
    //     itemData = itemData instanceof Array ? itemData : [itemData];
    //
    //     //return this.actor.createEmbeddedDocuments("Item", itemData);
    // }

    /** @override */
    getData(options) {
        const context = super.getData(options);
        console.log(context);
        return context;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-delete").click(this._onDeleteItem.bind(this));
        html.find(".item-edit").click(this._onEditItem.bind(this));
        html.find(".mod-add").click(this._onAddModifier.bind(this));
        html.find(".mod-delete").click(this._onDeleteModifier.bind(this));
    }

    /**
     *
     * @param {*} event
     * @returns
     */
    _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const itemType = li.data("itemType");
        let data = duplicate(this.item);

        switch (itemType) {
            case "capacity": {
                const rank = li.data("rank");
                data.system.capacities.splice(rank - 1, 1);
            }
                break;
        }

        return this.item.update(data);
    }

    /**
     * @param event
     * @private
     */
    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const itemType = li.data("itemType");

        switch (itemType) {
            case "capacity": {
                const rank = li.data("rank");
                const item = this.item.system.capacities[rank - 1];
                return fromUuid(item.source).then(document => document.sheet.render(true))
            }
            default :
                break;
        }
    }

    /**
     *
     * @param {*} event
     * @returns
     */
    _onAddModifier(event) {
        event.preventDefault();
        let newModifiers = foundry.utils.deepClone(this.item.modifiers); 
        newModifiers.push(new Modifier(this.item.uuid));
        return this.item.update({"system.modifiers": newModifiers});
    }

    /**
     *
     * @param {*} event
     * @returns
     */
    _onDeleteModifier(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".modifier-row");
        const rowId = li.data("itemId");
        let newModifiers = foundry.utils.deepClone(this.item.modifiers); 
        newModifiers.splice(rowId, 1);
        return this.item.update({"system.modifiers": newModifiers});
    }


}
