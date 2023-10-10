import { ITEM_TYPE } from "../../system/constants.mjs";
import CoBaseActorSheet from "./base-actor-sheet.mjs";
import { CoEditAbilitiesDialog } from "../../dialogs/edit-abilities-dialog.mjs";
import { Action } from "../../models/action/action.mjs";

export default class CoCharacterSheet extends CoBaseActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 600,
      width: 800,
      template: "systems/co/templates/actors/character-sheet.hbs",
      classes: ["co", "sheet", "actor", "character"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);
    context.system = this.actor.system;
    // console.debug(game.co.log(this.actor.system.abilities));
    context.abilities = this.actor.system.abilities;
    context.combat = this.actor.system.combat;
    context.attributes = this.actor.system.attributes;
    context.resources = this.actor.system.resources;
    context.details = this.actor.system.details;
    context.paths = this.actor.paths;
    context.pathGroups = this.actor.pathGroups;
    context.profiles = this.actor.profiles;
    context.capacities = this.actor.capacities;
    context.learnedCapacities = this.actor.learnedCapacities;
    context.capacitiesOffPaths = this.actor.capacitiesOffPaths;
    context.features = this.actor.features;
    context.actions = this.actor.actions;
    context.visibleActions = this.actor.visibleActions;
    context.visibleActivableActions = this.actor.visibleActivableActions;
    context.visibleNonActivableActions = this.actor.visibleNonActivableActions;
    context.visibleActivableTemporaireActions = this.actor.visibleActivableTemporaireActions;
    context.visibleNonActivableNonTemporaireActions = this.actor.visibleNonActivableNonTemporaireActions;
    context.inventory = this.actor.inventory;
    context.unlocked = this.actor.isUnlocked;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-edit").click(this._onEditItem.bind(this));
    html.find(".abilities-edit").click(this._onEditAbilities.bind(this));
    html.find(".item-delete").click(this._onDeleteItem.bind(this));
    html.find(".path-delete").click(this._onDeletePath.bind(this));
    html.find(".rollable").click(this._onRoll.bind(this));
    html.find(".toggle-action").click(this._onUseAction.bind(this));
    html.find(".attack").click(this._onUseAction.bind(this));
    html.find(".damage").click(this._onUseAction.bind(this));
    html.find(".capacity-learn").click(this._onLearnedToggle.bind(this));
    html.find(".inventory-equip").click(this._onEquippedToggle.bind(this));
    html.find(".use-recovery").click(this._onUseRecovery.bind(this));
  }

  /**
   * @description Action d'utiliser : active ou désactive une action
   * @param {*} event
   */
  _onUseAction(event) {
    const dataset = event.currentTarget.dataset;
    const action = dataset.action;
    const type = dataset.type;
    const source = dataset.source;
    const indice = dataset.indice;

    if (action === "activate") {
      this.actor.activateAction(true, source, indice, type);
    } else if (action === "unactivate") {
      this.actor.activateAction(false, source, indice, type);
    }
  }

  /** @inheritDoc */
  _onDragStart(event) {
    const target = event.currentTarget;
    let dragData;
    if (target.classList.contains("action")) {      
      const itemId = target.dataset.source;
      const indice = target.dataset.indice;
      const item = this.actor.items.get(itemId);
      const action = Action.createFromExisting(item.actions[indice]);
      // Get source (itemId) and indice
      dragData = action.toDragData(); 
      dragData.name = item.name;
      dragData.img = item.img;
      dragData.actionName = action.label;
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));      
    }
    else super._onDragStart(event);
  }

  /**
   * @description Dépense un point de récupération avec récupération de point de vie ou sans si Shift + Clic
   * @param {*} event
   * @private
   */
  _onUseRecovery(event) {
    event.preventDefault();
    if (event.shiftKey) {
      return this.actor.useRecovery(false);
    }
    return this.actor.useRecovery(true);
  }

  /**
   * @description Learned or unlearned the capacity in the path view
   * @param {*} event
   * @private
   */
  _onLearnedToggle(event) {
    event.preventDefault();
    const capacityId = $(event.currentTarget).parents(".item").data("itemId");
    this.actor.toggleCapacityLearned(capacityId);
  }

  /**
   * @description Select or unselect the capacity in the path view
   * @param {*} event
   * @param {Boolean} status the target status of the capacity, true if selected, false elsewhere
   * @private
   */
  _onEquippedToggle(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data("itemId");
    this.actor.toggleEquipmentEquipped(itemId);
  }

  /**
   * @description Open the item sheet
   * For capacity, open the embededd item
   * @param event
   * @private
   */
  _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const id = li.data("itemId");
    if (!foundry.utils.isEmpty(id) && id !== "") {
      let document = this.actor.items.get(id);
      return document.sheet.render(true);
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
    const itemType = li.data("itemType");
    switch (itemType) {
      case "path":
        this._onDeletePath(event);
        break;
      case "capacity":
        this._onDeleteCapacity(event);
        break;
      case "feature":
        this._onDeleteFeature(event);
        break;
      case "profile":
        this._onDeleteProfile(event);
        break;
      default:
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }
  }

  /**
   * @description Delete the selected feature
   * @param event
   * @private
   */
  async _onDeleteFeature(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const featureId = li.data("itemId");

    this.actor.deleteFeature(featureId);
  }

  /**
   * @description Delete the selected profile
   * @param event
   * @private
   */
  async _onDeleteProfile(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const profileId = li.data("itemId");

    this.actor.deleteProfile(profileId);
  }

  /**
   * @description Delete the selected path
   * @param event
   * @private
   */
  async _onDeletePath(event) {
    event.preventDefault();

    const li = $(event.currentTarget).closest(".item");
    const pathId = li.data("itemId");

    this.actor.deletePath(pathId);
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

    await this.actor.deleteCapacity(capacityId);
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

    // Handle item sorting within the same Actor
    // if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    switch (item.type) {
      case ITEM_TYPE.EQUIPMENT:
        return this.actor.addEquipment(item);
      case ITEM_TYPE.FEATURE:
        return this.actor.addFeature(item);
      case ITEM_TYPE.PROFILE:
        if (this.actor.profiles.length > 0) {
          ui.notifications.warn(game.i18n.localize("CO.notif.profilAlreadyExist"));
          break;
        }
        return this.actor.addProfile(item);
      case ITEM_TYPE.PATH:
        return this.actor.addPath(item);
      case ITEM_TYPE.CAPACITY:
        return this.actor.addCapacity(item, null);
      default:
        return false;
    }
  }

  /**
   * Edit Abilities event hander
   */
  async _onEditAbilities(event) {
    event.preventDefault();
    return new CoEditAbilitiesDialog(this.actor).render(true);
  }
}
