import CoBaseItemSheet from "./item-base-sheet.js";

export default class CoItemSheet extends CoBaseItemSheet {
  //#region Default

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["co", "sheet", "item"],
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /** @override */
  get template() {
    return "systems/co/templates/items/item-sheet.hbs";
  }
  //#endregion

  //#region Drop
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
      case "path":
        return ;//this._onDropPathItem(event, itemData);
      case "capacity":
        return this._onDropCapacityItem(item);
      case "profile":
      case "species":
      default:
        return false;
    }
  }

  /**
   *
   * @param {*} itemData
   * @param {String} uuid
   * @returns
   */
  _onDropCapacityItem(item) {
    console.log("_onDropCapacityItem : ", item);
    const itemData = item.toObject();

    if (this.item.type == "path") {
      if (this.item.hasCapacityBySource(itemData.flags.core.sourceId)) return;
      let system = foundry.utils.duplicate(this.item.system);
      system.capacities.push({
        source: item.uuid,
        key: item.system.key,
        name: itemData.name,
        img: itemData.img,        
        description: itemData.system.description,
        selected: false
      });
      const rank = system.maxRank === null ? 1 : system.maxRank + 1;
      system.maxRank = rank;

      this.item.update({ system: system });
    }
  }
  
  /**
   * Handle the final creation of dropped Item data on the Actor.
   * @param {object[]|object} itemData     The item data requested for creation
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];

    //return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  //#endregion

  //#region Context preparation

  /** @override */
  getData(options) {
    const context = super.getData(options);

    return context;
  }

  //#endregion

  //#region Listeners

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-delete").click(this._onDeleteItem.bind(this));
    html.find(".item-edit").click(this._onEditItem.bind(this));
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
      case "capacity":
        {
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
  async _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const itemType = li.data("itemType");

    switch (itemType) {
      case "capacity":
        {
          const rank = li.data("rank");
          const item = this.item.system.capacities[rank - 1];

          let document = await fromUuid(item.source);

          return document.sheet.render(true);
        }
        break;
    }
  }

  //#endregion
}
