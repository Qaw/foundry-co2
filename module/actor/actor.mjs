import { Stats } from "../system/stats.mjs";
import { ATTRIBUTE, COMBAT, EQUIPMENT_SUBTYPE, ITEM_TYPE, MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE, RESOURCES } from "../system/constants.mjs";
import { Action } from "../system/actions.mjs";
import { Modifiers, Modifier } from "../system/modifiers.mjs";
import { Resolver } from "../system/resolvers.mjs";
import { Log } from "../utils/log.mjs";
import { Utils } from "../system/utils.mjs";

/**
 * @class CoActor
 * @classdesc
 * @extends {Actor}
 *
 * @method
 */
export default class CoActor extends Actor {
  //#region accesseurs
  /**
   * @name abilitiesModifiers
   * @description Get all the modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Ability
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
    const paths = this.items.filter((item) => item.type === ITEM_TYPE.PATH);
    paths.forEach((path) => {
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

  get equipments() {
    return this.items.filter((item) => item.type === ITEM_TYPE.EQUIPMENT);
  }

  get equippedEquipments(){
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
  //#endregion

  //#region méthodes publiques
  prepareDerivedData() {
    switch(this.type) {
      case "character" : return this._prepareCharacterDerivedData();
      case "encounter" : return this._prepareEncounterDerivedData();
      default : return null;
    }
  }

  /**
   * Return all skill modifiers
   * @param {String} ability str, dex ...
   * @returns {Object} Name, value, description
   */
  getSkillBonuses(ability) {
    const modifiersByTarget = this.skillModifiers.filter((m) => m.target === ability);
    return modifiersByTarget.map((modifier) => ( { name: modifier.sourceName, value: modifier.evaluate(this), description: modifier.sourceDescription }));
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
    return this.getOverloadMalusToInitiative() + this.getIncompetentMalusToInitiative();
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
      default: break;
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
  async activateAction(state, source, indice) {
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
        let res = resolver.resolve(this, item);
      }
    }
  }

  /**
   * @description Apprend/désapprend une capacité du personnage
   * Change le champ learned de la capactié
   * Met à jour le rank de la voie correspondante
   * Met à jour le champ visible de toutes les actions de la capacité
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
    // Mise à jour de la capacité et de ses actions
    await this._toggleItemFieldAndActions(itemId, "equipped");
  }

  /**
   * @description Create a path, and the linked modifiers, paths and capacities if they exist
   * @param {*} feature
   */
  async addFeature(feature) {
    let itemData = feature.toObject();
    itemData = itemData instanceof Array ? itemData : [itemData];
    const newFeature = await this.createEmbeddedDocuments("Item", itemData);
    Log.info("Feature created : ", newFeature);

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
        const newCapacityId = await this.addCapacity(capa, newFeature[0].id);
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
    Log.info("Profile created : ", newProfile);

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
    this.update({"system.combat.magic.ability": profile.system.spellcasting});
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
    console.log("Path created : ", newPath);

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
    Log.info("Capacity created : ", newCapacity);

    // Update the source of all actions with the id of the new embedded capacity created
    let newActions = Object.values(foundry.utils.deepClone(newCapacity[0].system.actions)).map(
      (m) => {
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
      let newActions = Object.values(foundry.utils.deepClone(newEquipment[0].system.actions)).map(
        (m) => {
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

  deletePath(pathId) {
    // Delete linked capacities
    const capacitiesId = this.items.get(pathId).system.capacities;
    this.deleteEmbeddedDocuments("Item", capacitiesId);

    this.deleteEmbeddedDocuments("Item", [pathId]);
  }

  async deleteCapacity(capacityId) {
    // Remove the capacity from the capacities list of the linked Path
    const capacity = this.items.get(capacityId);
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

  //#endregion

  //#region méthodes privées
  /**
   * Perform any Character specific preparation.
   * @protected
   */
  _prepareCharacterDerivedData() {
    this._prepareAbilities();

    for (const [key, skill] of Object.entries(this.system.combat)) {
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
      const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;

      if ([COMBAT.MELEE, COMBAT.RANGED, COMBAT.MAGIC].includes(key)) {
        this._prepareAttack(key, skill, abilityBonus, bonuses);
      }

      if (key === COMBAT.INIT) {
        this._prepareInit(skill, bonuses);
      }

      if (key === COMBAT.DEF) {
        this._prepareDef(skill, abilityBonus, bonuses);
      }
    }

    this._prepareHPMax();

    for (const [key, skill] of Object.entries(this.system.resources)) {
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);

      // Points de chance  - Fortune Points - FP
      if (key === RESOURCES.FORTUNE) {
        this._prepareFP(skill, bonuses);
      }

      // Points de mana - Mana Points - MP
      if (key === RESOURCES.MANA) {
        this._prepareMP(skill, bonuses);
      }

      // Points de récupération - Recovery Points - RP
      if (key === RESOURCES.RECOVERY) {
        this._prepareRP(skill, bonuses);
      }
    }
  }

  /**
   * Perform any Encounter specific preparation.
   * @protected
   */
  _prepareEncounterDerivedData() {

    for (const [key, ability] of Object.entries(this.system.abilities)) {
      Log.debug(ability);
    //   const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr);
    //   const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key);
    //
    //   ability.value = ability.base + bonuses + abilityModifiers.total;
    //   ability.tooltip = abilityModifiers.tooltip;
    //
    //   ability.mod = Stats.getModFromValue(ability.value);
    }

    // for (const [key, skill] of Object.entries(this.system.combat)) {
    //   const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
    //   const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;
    //
    //   if ([COMBAT.MELEE, COMBAT.RANGED, COMBAT.MAGIC].includes(key)) {
    //     this._prepareAttack(key, skill, abilityBonus, bonuses);
    //   }
    //
    //   if (key === COMBAT.INIT) {
    //     this._prepareInit(skill, bonuses);
    //   }
    //
    //   if (key === COMBAT.DEF) {
    //     this._prepareDef(skill, abilityBonus, bonuses);
    //   }
    // }

    // this._prepareHPMax();

    // for (const [key, skill] of Object.entries(this.system.resources)) {
    //   const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
    //
    //   // Points de chance  - Fortune Points - FP
    //   if (key === RESOURCES.FORTUNE) {
    //     this._prepareFP(skill, bonuses);
    //   }
    //
    //   // Points de mana - Mana Points - MP
    //   if (key === RESOURCES.MANA) {
    //     this._prepareMP(skill, bonuses);
    //   }
    //
    //   // Points de récupération - Recovery Points - RP
    //   if (key === RESOURCES.RECOVERY) {
    //     this._prepareRP(skill, bonuses);
    //   }
    // }
  }

  _prepareFP(skill, bonuses) {
    skill.base = this._computeBaseFP();
    skill.max = skill.base + bonuses;
  }

  _computeBaseFP() {
    return 0;
  }

  // BASE : à partir du profile, lire la mpFormula
  _prepareMP(skill, bonuses) {
    skill.base = this._computeBaseMP();
    skill.max = skill.base + bonuses;
  }

  _computeBaseMP() {
    let total = 0;
    let formula = null;
    const profile = this.profile;
    if (profile.length != 0) formula = this.profile[0].system.mpFormula;
    total = formula ? Utils.evaluate(this, formula, null, true) : 0;
    return total;
  }

  _prepareRP(skill, bonuses) {
    skill.base = this._computeBaseRP();
    skill.max = skill.base + bonuses;
  }

  _computeBaseRP() {
    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, MODIFIER_TARGET.RP);
    return 5 + resourceModifiers.total;
  }

  _prepareHPMax() {
    const hpMaxBonuses = Object.values(this.system.attributes.hp.bonuses).reduce((prev, curr) => prev + curr);
    const hpMaxModifiers = Modifiers.computeTotalModifiersByTarget(this, this.attributeModifiers, ATTRIBUTE.HP);
    this.system.attributes.hp.max = this.system.attributes.hp.base + hpMaxBonuses + hpMaxModifiers.total;
    this.system.attributes.hp.tooltip = Utils.getTooltip("Base", this.system.attributes.hp.base) + hpMaxModifiers.tooltip;
  }

  _prepareDef(skill, abilityBonus, bonuses) {
    const defModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, COMBAT.DEF);
    // const protection = this.getDefenceFromArmorAndShield();

    skill.base = game.settings.get("co", "baseDef");
    skill.tooltipBase = Utils.getTooltip("Base", skill.base);

    skill.base += abilityBonus;
    skill.tooltipBase += Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus);

    skill.value = skill.base + bonuses + defModifiers.total; // + protection;
    skill.tooltipValue = defModifiers.tooltip;
  }

  _prepareInit(skill, bonuses) {
    const abilityValue = skill.ability && this.system.abilities[skill.ability].value ? this.system.abilities[skill.ability].value : 0;
    const initModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, COMBAT.INIT);
    const malus = this.getMalusToInitiative();
    skill.base = abilityValue;
    skill.value = skill.base + bonuses + initModifiers.total + malus;
    skill.tooltipBase = Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityValue);
    skill.tooltipValue = initModifiers.tooltip;
  }

  _prepareAttack(key, skill, abilityBonus, bonuses) {
    const levelBonus = this.system.attributes.level.value ? this.system.attributes.level.value : 0;
    const combatModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key);
    // skill.value = skill.base + abilityBonus + levelBonus;
    skill.base = abilityBonus + levelBonus;
    skill.tooltipBase = Utils.getTooltip(game.i18n.localize("CO.label.long.level"), levelBonus) + Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus);
    skill.mod = skill.base + bonuses + combatModifiers.total;
    skill.tooltipMod = combatModifiers.tooltip;
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
      // Log.debug(ability);
      const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr);
      const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key);

      ability.value = ability.base + bonuses + abilityModifiers.total;
      ability.tooltip = abilityModifiers.tooltip;

      ability.mod = Stats.getModFromValue(ability.value);
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
  //#endregion

  _getModifiersBySubtype(subtype) {
    return [
      ...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, subtype)
    ];
  }

  //
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
