import { ATTRIBUTE, COMBAT, EQUIPMENT_SUBTYPE, ITEM_TYPE, MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE } from "../system/constants.mjs";
import { Action } from "../models/action/action.mjs";
import { Modifier, Modifiers } from "../models/action/modifiers.mjs";
import { Resolver } from "../models/action/resolvers.mjs";
import { Utils } from "../system/utils.mjs";

/**
 * @class CoActor
 * @classdesc
 * @extends {Actor}
 *
 * @method
 */

export default class CoActor extends Actor {
  constructor(...args) {
    let data = args[0];
    if (!data.img && game.co.config.actorIcons[data.type]) data.img = game.co.config.actorIcons[data.type];
    super(...args);
  }

  //#region accesseurs

  /**
   * @returns les Items de type equipment
   */
  get equipments() {
    return this.items.filter((item) => item.type === ITEM_TYPE.EQUIPMENT);
  }

  /**
   * @returns les Items de type feature
   */
  get features() {
    return this.items.filter((item) => item.type === ITEM_TYPE.FEATURE);
  }

  /**
   * @returns les Items de type profile
   */
  get profiles() {
    return this.items.filter((item) => item.type === ITEM_TYPE.PROFILE);
  }

  /**
   * @returns le premier Item de type profile
   */
  get profile() {
    const profile = this.items.find((item) => item.type === ITEM_TYPE.PROFILE);
    return profile !== undefined ? [profile] : [];
  }

  /**
   * @returns les Items de type path
   */
  get paths() {
    return this.items.filter((item) => item.type === ITEM_TYPE.PATH);
  }

  /**
   * @returns renvoie un tableau d'objets comprenant les voies et les capacités associées
   */
  get pathGroups() {
    let pathGroups = [];
    this.paths.forEach((path) => {
      const capacities = path.system.capacities.map((cid) => this.items.find((i) => i._id === cid));
      pathGroups.push({
        path: path,
        items: capacities,
      });
    });
    return pathGroups;
  }

  get inventory() {
    return {
      armors: this.armors,
      shields: this.shields,
      weapons: this.weapons,
      misc: this.misc,
    };
  }

  get capacities() {
    return this.items.filter((item) => item.type === ITEM_TYPE.CAPACITY);
  }

  get learnedCapacities() {
    return this.items.filter((item) => item.type === ITEM_TYPE.CAPACITY && item.system.learned);
  }

  get capacitiesOffPaths() {
    return this.items.filter((item) => item.type === ITEM_TYPE.CAPACITY && item.system.path === null)
  }

  get equipments() {
    return this.items.filter((item) => item.type === ITEM_TYPE.EQUIPMENT);
  }

  get equippedEquipments() {
    return this.items.filter((item) => item.type === ITEM_TYPE.EQUIPMENT && item.system.equipped);
  }

  /**
   * @returns les Items de type equipment et de sous-type armor
   */
  get armors() {
    return this.equipments.filter((item) => item.system.subtype === EQUIPMENT_SUBTYPE.ARMOR);
  }

  /**
   * @returns les Items de type equipment et de sous-type shield
   */
  get shields() {
    return this.equipments.filter((item) => item.system.subtype === EQUIPMENT_SUBTYPE.SHIELD);
  }

  /**
   * @returns les Items de type equipment et de sous-type weapon
   */
  get weapons() {
    return this.equipments.filter((item) => item.system.subtype === EQUIPMENT_SUBTYPE.WEAPON);
  }

  get misc() {
    return this.equipments.filter((item) => item.system.subtype === EQUIPMENT_SUBTYPE.MISC);
  }

  /**
   * @returns les Items équipés de type equipment et de sous-type armor
   */
  get equippedArmors() {
    return this.armors.filter((item) => item.system.equipped);
  }

  /**
   * @returns les Items équipés de type equipment et de sous-type shield
   */
  get equippedShields() {
    return this.shields.filter((item) => item.system.equipped);
  }

  /**
   * @returns Toutes les actions de tous les objets
   */
  get actions() {
    let allActions = [];
    this.items.forEach((item) => {
      if (item.actions.length > 0) allActions.push(...item.actions);
    });
    return allActions;
  }

  /**
   * @returns Toutes les actions visibles des capacités et des équipements
   */
  get visibleActions() {
    let allActions = [];
    this.items.forEach((item) => {
      if ([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.CAPACITY].includes(item.type) && item.actions.length > 0) {
        allActions.push(...item.visibleActions);
      }
    });
    return allActions;
  }

  /**
   * @returns Toutes les actions visibles et activables des capacités et des équipements
   */
  get visibleActivableActions() {
    return this.visibleActions.filter((a) => a.properties.activable);
  }

  /**
   * @returns Toutes les actions visibles et activables des capacités et des équipements
   */
  get visibleNonActivableActions() {
    return this.visibleActions.filter((a) => !a.properties.activable);
  }

  /**
   * @name abilitiesModifiers
   * @description Get all the modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype AbilityValue
   * @public
   * @returns {Modifier[]} An empty array or an array of Modifiers
   */
  get abilitiesModifiers() {
    return this._getModifiersBySubtype(MODIFIER_SUBTYPE.ABILITY);
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Combat
   */
  get combatModifiers() {
    return this._getModifiersBySubtype(MODIFIER_SUBTYPE.COMBAT);
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Attribute
   */
  get attributeModifiers() {
    return this._getModifiersBySubtype(MODIFIER_SUBTYPE.ATTRIBUTE);
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Skill
   */
  get skillModifiers() {
    return this._getModifiersBySubtype(MODIFIER_SUBTYPE.SKILL);
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of typeEquipment, Feature, Profile or Capacity with the subtype Resource
   */
  get resourceModifiers() {
    return this._getModifiersBySubtype(MODIFIER_SUBTYPE.RESOURCE);
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  //#endregion

  //#region méthodes publiques
  prepareDerivedData() {}

  /**
   * Return all skill modifiers
   * @param {String} ability str, dex ...
   * @returns {Object} Name, value, description
   */
  async getSkillBonuses(ability) {
    const modifiersByTarget = this.skillModifiers.filter((m) => m.target === ability);
    let bonuses = [];
    for (const modifier of modifiersByTarget) {
      const sourceInfos = await modifier.getSourceInfos();
      bonuses.push({ name: sourceInfos.name, value: modifier.evaluate(this), description: sourceInfos.description });
    }
    return bonuses;
  }

  /**
   *
   * @param {*} key
   * @returns l'objet correspondant à la clé
   */
  getEmbeddedItemByKey(key) {
    return this.items.find((item) => item.system.key === key);
  }

  /**
   * @name getMalusToInitiative
   * @description Retourne le malus à l'initiative lié à l'armure et à l'incompétence armes/armures
   * @public
   *
   * @returns {int} retourne le malus (négatif) ou 0
   */
  getMalusToInitiative() {
    return 0;
    // return this.getOverloadMalusToInitiative() + this.getIncompetentMalusToInitiative();
  }

  /**
   * @name getOverloadMalusToInitiative
   * @description Retourne le malus à l'initiative lié à l'armure
   * @public
   *
   * @returns {int} retourne le malus (négatif) ou 0 ; par défaut, retourne 0
   */
  getOverloadMalusToInitiative() {
    return 0;
  }

  /**
   * @name getIncompetentMalusToInitiative
   * @description Retourne le malus à l'initiative lié à l'incompétence armes/armures
   * @public
   *
   * @returns {int} retourne le malus (négatif) ou 0 ; par défaut, retourne 0
   */
  getIncompetentMalusToInitiative() {
    return 0;
  }

  /**
   * @name getDefenceFromArmorAndShield
   * @description calcule la défense de l'armure et du bouclier équipés
   * @returns {Int} la somme des DEF
   */
  getDefenceFromArmorAndShield() {
    return this.getDefenceFromArmor() + this.getDefenceFromShield();
  }

  /**
   * @name getDefenceFromArmor
   * @description calcule la défense de l'armure équipée
   * @returns {Int} la valeur de défense
   */
  getDefenceFromArmor() {
    let protections = this.equippedArmors.map((i) => i.system.def);
    return this._addAllValues(protections);
  }

  /**
   * @name getDefenceFromShield
   * @description calcule la défense du bouclier équipé
   * @returns {Int} la valeur de défense
   */
  getDefenceFromShield() {
    let protections = this.equippedShields.map((i) => i.system.def);
    return this._addAllValues(protections);
  }

  /**
   *
   * @param {*} itemId
   * @returns
   */
  deleteItem(itemId) {
    const item = this.items.find((item) => item.id === itemId);
    switch (item.type) {
      case ITEM_TYPE.CAPACITY:
      case ITEM_TYPE.FEATURE:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
      default:
        break;
    }
  }

  /**
   *
   * @param {*} itemId
   * @returns
   */
  isTrainedWithWeapon(itemId) {
    const item = this.weapons.find((item) => item.id === itemId);
    if (!item) return null;
    const profile = this.profile;
    if (profile.length == 0) return null;
    const training = item.system.martialCategory;
    return profile.system.martialTrainingsWeapons[training];
  }

  /**
   *
   * @param {*} itemId
   * @returns
   */
  isTrainedWithArmor(itemId) {
    const item = this.armors.find((item) => item.id === itemId);
    if (!item) return null;
    const profile = this.profile;
    if (profile.length == 0) return null;
    const training = item.system.martialCategory;
    return profile.system.martialTrainingsArmors[training];
  }

  /**
   *
   * @param {*} itemId
   * @returns
   */
  isTrainedWithShield(itemId) {
    const item = this.shields.find((item) => item.id === itemId);
    if (!item) return null;
    const profile = this.profile;
    if (profile.length == 0) return null;
    const training = item.system.martialCategory;
    return profile.system.martialTrainingsShields[training];
  }

  /**
   * @description
   * @param {*} state true to enable the action, false to disable the action
   * @param {*} source  uuid of the embedded item which is the source of the action
   * @param {*} indice  indice of the action in the array of actions
   */
  async activateAction(state, source, indice, type) {
    const item = this.items.get(source);

    // Action avec une durée
    if (item.system.actions[indice].properties.temporary) {
      let newActions = foundry.utils.deepClone(item.system.actions);
      if (state) {
        newActions[indice].properties.enabled = true;
      } else {
        newActions[indice].properties.enabled = false;
      }

      const updateData = { _id: item.id, "system.actions": newActions };

      await this.updateEmbeddedDocuments("Item", [updateData]);
    }
    // Action instantanée
    else {
      const action = item.system.actions[indice];
      // Recherche des resolvers de l'action
      let resolvers = Object.values(action.resolvers).map((a) => new Resolver(a.type, a.skill, a.dmg));
      for (const resolver of resolvers) {
        let res = resolver.resolve(this, item, action, type);
      }
    }
  }

  toggleSuperior(ability) {
    return (this.system.abilities[ability].superior = !this.system.abilities[ability].superior);
  }

  /**
   * @description Apprend/désapprend une capacité du personnage
   * Change le champ learned de la capactié
   * Met à jour le rank de la voie correspondante
   * @param {*} capacityId
   */
  async toggleCapacityLearned(capacityId) {
    // Mise à jour de la capacité et de ses actions
    await this._toggleItemFieldAndActions(capacityId, "learned");

    // Mise à jour du rang de la voie correspondante
    let path = this.items.get(this.items.get(capacityId).system.path);
    path.updateRank();
  }

  /**
   * @description Equippe/Déséquippe un equipment du personnage
   * Change le champ equipped de l'equipement
   * @param {*} itemId
   */
  async toggleEquipmentEquipped(itemId) {
    // Mise à jour de l'item et de ses actions
    await this._toggleItemFieldAndActions(itemId, "equipped");
  }

  /**
   * @description Create a feature, and the linked modifiers, paths and capacities if they exist
   * @param {*} feature
   */
  async addFeature(feature) {
    let itemData = feature.toObject();
    itemData = itemData instanceof Array ? itemData : [itemData];
    const newFeature = await this.createEmbeddedDocuments("Item", itemData);
    // console.info(game.co.log("Feature created"), newFeature);

    // Update the source of all modifiers with the id of the new embedded feature created
    let newModifiers = Object.values(foundry.utils.deepClone(newFeature[0].system.modifiers)).map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value));
    newModifiers.forEach((modifier) => {
      modifier.updateSource(newFeature[0].id);
    });

    const updateModifiers = { _id: newFeature[0].id, "system.modifiers": newModifiers };

    await this.updateEmbeddedDocuments("Item", [updateModifiers]);

    // Create all Paths
    let updatedPathsIds = [];
    for (const path of feature.system.paths) {
      let originalPath = await fromUuid(path);

      // item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (originalPath != null) {
        const newPathId = await this.addPath(originalPath);
        updatedPathsIds.push(newPathId);
      }
    }

    // Update the paths of the feature with ids of created paths
    const updatePaths = { _id: newFeature[0].id, "system.paths": updatedPathsIds };
    await this.updateEmbeddedDocuments("Item", [updatePaths]);

    // Create all Capacities
    let updatedCapacitiesIds = [];
    for (const capacity of feature.system.capacities) {
      let capa = await fromUuid(capacity);

      // item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (capa != null) {
        const newCapacityId = await this.addCapacity(capa, null);
        updatedCapacitiesIds.push(newCapacityId);
      }
    }

    // Update the capacities of the feature with ids of created capacities
    const updateCapacities = { _id: newFeature[0].id, "system.capacities": updatedCapacitiesIds };
    await this.updateEmbeddedDocuments("Item", [updateCapacities]);
  }

  /**
   * @description Create a profile, and the linked modifiers and paths if they exist
   * @param {*} profile
   */
  async addProfile(profile) {
    let itemData = profile.toObject();
    itemData = itemData instanceof Array ? itemData : [itemData];
    const newProfile = await this.createEmbeddedDocuments("Item", itemData);
    // console.info(game.co.log("Profile created"), newProfile);

    if (newProfile[0].system.modifiers.length > 0) {
      // Update the source of all modifiers with the id of the new embedded profile created
      let newModifiers = Object.values(foundry.utils.deepClone(newProfile[0].system.modifiers)).map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value));
      newModifiers.forEach((modifier) => {
        modifier.updateSource(newProfile[0].id);
      });

      const updateModifiers = { _id: newProfile[0].id, "system.modifiers": newModifiers };

      await this.updateEmbeddedDocuments("Item", [updateModifiers]);
    }

    // Create all Paths
    let updatedPathsIds = [];
    for (const path of profile.system.paths) {
      let originalPath = await fromUuid(path);

      // item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (originalPath != null) {
        const newPathId = await this.addPath(originalPath);
        updatedPathsIds.push(newPathId);
      }
    }

    // Update the paths of the profile with ids of created paths
    const updatePaths = { _id: newProfile[0].id, "system.paths": updatedPathsIds };
    await this.updateEmbeddedDocuments("Item", [updatePaths]);

    // Update Hit Dice and Magick Attack base ability
    this.update({ "system.combat.magic.ability": profile.system.spellcasting });
  }

  /**
   * @description Add a path as an embedded item
   * It also create the capacities linked to the path
   * @param {CoItem} path
   * @returns {Number} id of the created path
   */
  async addPath(path) {
    let itemData = path.toObject();

    // Create the path
    itemData = itemData instanceof Array ? itemData : [itemData];
    const newPath = await this.createEmbeddedDocuments("Item", itemData);
    // console.log("Path created : ", newPath);

    let updatedCapacitiesIds = [];

    // Create all capacities
    for (const capacity of path.system.capacities) {
      let capa = await fromUuid(capacity);

      // item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (capa != null) {
        const newCapacityId = await this.addCapacity(capa, newPath[0].id);
        updatedCapacitiesIds.push(newCapacityId);
      }
    }

    // Update the array of capacities of the path with ids of created path
    const updateData = { _id: newPath[0].id, "system.capacities": updatedCapacitiesIds };
    await this.updateEmbeddedDocuments("Item", [updateData]);

    return newPath[0].id;
  }

  /**
   * @description Add a capacity as an embedded item
   * @param {CoItem} capacity
   * @param {Number} pathId id of the Path if the capacity is linked to a path
   * @returns {Number} id of the created capacity
   */
  async addCapacity(capacity, pathId) {
    let capacityData = capacity.toObject();
    if (pathId !== null) capacityData.system.path = pathId;

    // Learned the capacity if the capacity is not linked to a path
    if (pathId === null) capacityData.system.learned = true;

    capacityData = capacityData instanceof Array ? capacityData : [capacityData];
    const newCapacity = await this.createEmbeddedDocuments("Item", capacityData);
    // console.info(game.co.log("Capacity created"), newCapacity);

    // Update the source of all actions with the id of the new embedded capacity created
    let newActions = Object.values(foundry.utils.deepClone(newCapacity[0].system.actions)).map((m) => {
      const action = new Action(
        m.source,
        m.indice,
        m.type,
        m.img,
        m.label,
        m.chatFlavor,
        m.properties.visible,
        m.properties.activable,
        m.properties.enabled,
        m.properties.temporary,
        m.conditions,
        m.modifiers,
        m.resolvers
      );
      // Update the source and source's modifiers for the action
      action.updateSource(newCapacity[0].id);
      return action;
    });

    const updateActions = { _id: newCapacity[0].id, "system.actions": newActions };
    await this.updateEmbeddedDocuments("Item", [updateActions]);

    return newCapacity[0].id;
  }

  /**
   * @description Add an equipment as an embedded item
   * @param {CoItem} equipment
   * @returns {Number} id of the created path
   */
  async addEquipment(equipment) {
    let equipmentData = equipment.toObject();
    equipmentData = equipmentData instanceof Array ? equipmentData : [equipmentData];

    // Création de l'objet
    const newEquipment = await this.createEmbeddedDocuments("Item", equipmentData);

    // Update the source of all actions
    if (newEquipment[0].actions.length > 0) {
      let newActions = Object.values(foundry.utils.deepClone(newEquipment[0].system.actions)).map((m) => {
        const action = new Action(
          m.source,
          m.indice,
          m.type,
          m.img,
          m.label,
          m.chatFlavor,
          m.properties.visible,
          m.properties.activable,
          m.properties.enabled,
          m.properties.temporary,
          m.conditions,
          m.modifiers,
          m.resolvers
        );
        // Update the source and source's modifiers for the action
        action.updateSource(newEquipment[0].id);
        return action;
      });

      const updateActions = { _id: newEquipment[0].id, "system.actions": newActions };
      await this.updateEmbeddedDocuments("Item", [updateActions]);
    }
  }

  deleteFeature(featureId) {
    // Delete linked paths
    const pathsIds = this.items.get(featureId).system.paths;
    for (const pathId of pathsIds) {
      this.deletePath(pathId);
    }
    // Delete linked capacities
    const capacitiesIds = this.items.get(featureId).system.capacities;
    for (const capacityId of capacitiesIds) {
      this.deleteCapacity(capacityId);
    }
    this.deleteEmbeddedDocuments("Item", [featureId]);
  }

  deleteProfile(profileId) {
    // Delete linked paths
    const pathsIds = this.items.get(profileId).system.paths;
    for (const pathId of pathsIds) {
      this.deletePath(pathId);
    }
    this.deleteEmbeddedDocuments("Item", [profileId]);
  }

  deletePath(pathId) {
    // Delete linked capacities
    const path = this.items.get(pathId);
    if (path) {
      const capacitiesId = path.system.capacities;
      this.deleteEmbeddedDocuments("Item", capacitiesId);
      this.deleteEmbeddedDocuments("Item", [pathId]);
    }
  }

  async deleteCapacity(capacityId) {
    // Remove the capacity from the capacities list of the linked Path
    const capacity = this.items.get(capacityId);

    if (capacity) {
      const pathId = capacity.system.path;
      if (pathId != null) {
        // If the linked path still exists in the items
        if (this.items.get(pathId)) {
          let updatedCapacitiesIds = this.items.get(pathId).system.capacities.filter((id) => id !== capacityId);
          const updateData = { _id: pathId, "system.capacities": updatedCapacitiesIds };
          await this.updateEmbeddedDocuments("Item", [updateData]);
        }
      }
      this.deleteEmbeddedDocuments("Item", [capacityId]);
    }
  }

  //#endregion

  //#region méthodes privées

  _prepareFP(skill, bonuses) {
    skill.base = this._computeBaseFP();
    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, MODIFIER_TARGET.FP);

    skill.max = skill.base + resourceModifiers.total + bonuses;
  }

  _computeBaseFP() {
    return 0;
  }

  // BASE : à partir du profile, lire la mpFormula
  _prepareMP(skill, bonuses) {
    skill.base = this._computeBaseMP();
    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, MODIFIER_TARGET.MP);

    skill.max = skill.base + resourceModifiers.total + bonuses;
  }

  // 2 * @niv + @int
  _computeBaseMP() {
    let total = 0;
    let formula = this.profiles.length != 0 && this.profiles[0].system.mpFormula ? this.profiles[0].system.mpFormula : null;
    total = formula ? Utils.evaluate(this, formula, null, true) : 0;
    return total;
  }

  _prepareRP(skill, bonuses) {
    skill.base = this._computeBaseRP();
    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, MODIFIER_TARGET.RP);

    skill.max = skill.base + resourceModifiers.total + bonuses;
  }

  _computeBaseRP() {
    return 5;
  }

  _prepareHPMax() {
    const hpMaxBonuses = Object.values(this.system.attributes.hp.bonuses).reduce((prev, curr) => prev + curr);
    const hpMaxModifiers = Modifiers.computeTotalModifiersByTarget(this, this.attributeModifiers, ATTRIBUTE.HP);
    this.system.attributes.hp.max = this.system.attributes.hp.base + hpMaxBonuses + hpMaxModifiers.total;
    this.system.attributes.hp.tooltip = Utils.getTooltip("Base", this.system.attributes.hp.base).concat(hpMaxModifiers.tooltip, Utils.getTooltip("Bonus", hpMaxBonuses));
  }

  /**
   * Dans COF : 10 + Mod DEX + Bonus Armure + Bonus Bouclier + Bonus Capacités
   * @param {*} skill
   * @param {*} abilityBonus
   * @param {*} bonuses
   */
  _prepareDef(skill, abilityBonus, bonuses) {
    const defModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, COMBAT.DEF);

    skill.base = game.settings.get("co", "baseDef");
    skill.tooltipBase = Utils.getTooltip("Base", skill.base);
    skill.base += abilityBonus;
    skill.tooltipBase = skill.tooltipBase.concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus));

    skill.value = skill.base + bonuses + defModifiers.total;
    skill.tooltipValue = skill.tooltipBase.concat(defModifiers.tooltip, Utils.getTooltip("Bonus", bonuses));
  }

  _prepareInit(skill, bonuses) {
    const abilityValue = skill.ability && this.system.abilities[skill.ability].value ? this.system.abilities[skill.ability].value : 0;
    const initModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, COMBAT.INIT);
    const malus = this.getMalusToInitiative();

    skill.base = abilityValue;
    skill.tooltipBase = Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityValue);

    skill.value = skill.base + bonuses + initModifiers.total + malus;
    skill.tooltipValue = skill.tooltipBase.concat(initModifiers.tooltip, Utils.getTooltip("Bonus", bonuses));
  }

  _prepareAttack(key, skill, abilityBonus, bonuses) {
    const levelBonus = this.system.attributes.level.base ? this.system.attributes.level.base : 0;
    const combatModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key);

    skill.base = abilityBonus + levelBonus;
    skill.tooltipBase = Utils.getTooltip(game.i18n.localize("CO.label.long.level"), levelBonus).concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus));

    skill.value = skill.base + bonuses + combatModifiers.total;
    skill.tooltipValue = skill.tooltipBase.concat(combatModifiers.tooltip, Utils.getTooltip("Bonus", bonuses));
  }

  /**
   * @name _prepareAbilities
   * @description Calcule la valeur et le mod des caractéristiques <br/>
   *              Valeur = base + bonus + modificateurs <br/>
   *              bonus est à la somme du bonus de la fiche et du champ dédié aux Active Effets <br/>
   *              modificateurs est la somme de tous les modificateurs modifiant la caractéristique, quelle que soit la source
   */
  _prepareAbilities() {
    for (const [key, ability] of Object.entries(this.system.abilities)) {
      const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr);
      const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key);
      ability.modifiers = abilityModifiers.total;

      ability.value = ability.base + bonuses + ability.modifiers;
      ability.tooltipValue = Utils.getTooltip(Utils.getAbilityName(key), ability.base).concat(abilityModifiers.tooltip, Utils.getTooltip("Bonus", bonuses));
    }
  }

  /**
   * @name _addAllValues
   * @description Calcul la somme d'un tableau de valeurs positives ou négatives
   *
   * @param {*} array Un tableau de valeurs
   * @returns {int} 0 ou la somme des valeurs
   */
  _addAllValues(array) {
    return array.length > 0 ? array.reduce((acc, curr) => acc + curr, 0) : 0;
  }

  /**
   * @description toggle the field of the items and the actions linked
   * @param {*} itemId
   * @param {*} fieldName
   */
  async _toggleItemFieldAndActions(itemId, fieldName) {
    let item = this.items.get(itemId);
    let fieldValue = item.system[fieldName];
    await this.updateEmbeddedDocuments("Item", [{ _id: itemId, [`system.${fieldName}`]: !fieldValue }]);
    if (item.actions.length > 0) {
      item.toggleActions();
    }
  }

  _getModifiersBySubtype(subtype) {
    return [
      ...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.profiles, MODIFIER_TYPE.PROFILE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, subtype),
    ];
  }
  //#endregion

  // deleteItem(itemId) {
  //   const item = this.items.find(item => item.id === itemId);
  //
  //   switch (item.type) {
  //     case ITEM_TYPE.PATH:
  //       {
  //         // Path
  //         let itemsToDelete = [];
  //         itemsToDelete.push (item.id);
  //
  //         // Capacities
  //         item.system.capacities.map( c =>  {
  //               const item = this.getEmbeddedItemByKey(c.key);
  //               if (item) itemsToDelete.push(item.id);
  //         });
  //         return this.deleteEmbeddedDocuments("Item", itemsToDelete);
  //       }
  //     case ITEM_TYPE.CAPACITY:
  //       {
  //         // Check if the capacity was selected in a path
  //         this.paths.forEach(path => {
  //           let capacities = duplicate(path.system.capacities);
  //           let capacity = capacities.find((capacity) => capacity.key == item.system.key);
  //           if (capacity)  {
  //             capacity.selected = false;
  //             const updateData = [{ _id: path.id, "system.capacities": capacities }];
  //             this.updateEmbeddedDocuments("Item", updateData);
  //           }
  //         });
  //         return this.deleteEmbeddedDocuments("Item", [itemId]);
  //       }
  //   }
  // }
}
