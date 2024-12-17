import { SYSTEM } from "../config/system.mjs"
import { Action } from "../models/action/action.mjs"
import { Modifier, Modifiers } from "../models/action/modifiers.mjs"
import { Resolver } from "../models/action/resolvers.mjs"
import Utils from "../utils.mjs"

/**
 * @class CoActor
 * @classdesc
 * @extends {Actor}
 *
 * @function
 */

export default class CoActor extends Actor {
  constructor(...args) {
    let data = args[0]
    if (!data.img && SYSTEM.ACTOR_ICONS[data.type]) data.img = SYSTEM.ACTOR_ICONS[data.type]
    super(...args)
  }

  // #region accesseurs

  get baseInitiative() {
    return 10
  }

  get baseDefense() {
    return 10
  }

  /**
   * Retourne les Items de type equipment
   */
  get equipments() {
    return this.itemTypes.equipment
  }

  /**
   * Retourne les Items de type feature
   */
  get features() {
    return this.itemTypes.feature
  }

  /**
   * Retourne les Items de type path
   */
  get paths() {
    return this.itemTypes.path
  }

  get capacities() {
    return this.itemTypes.capacity
  }

  /**
   * Retourne un tableau d'objets comprenant les voies et les capacités associées
   */
  get pathGroups() {
    let pathGroups = []
    this.paths.forEach((path) => {
      const capacities = path.system.capacities.map((cid) => this.items.find((i) => i._id === cid))
      // Console.log(path);
      console.log(path.system.rank)
      // Console.log(capacities);
      // const rank = path.system.rank;
      // const capacities = path.system.capacities;
      // for (let index = 0; index < rank; index++) {
      //   let capacity = this.items.get(capacities[index]);
      //   if (capacity.system.learned) {
      //     if (index === 0 || index === 1) xp += 1;
      //     else xp +=2;
      //   }
      // }

      pathGroups.push({
        path: path,
        items: capacities,
      })
    })
    return pathGroups
  }

  get inventory() {
    return {
      armors: this.armors,
      shields: this.shields,
      weapons: this.weapons,
      misc: this.misc,
    }
  }

  get learnedCapacities() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.CAPACITY && item.system.learned)
  }

  get capacitiesOffPaths() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.CAPACITY && item.system.path === null)
  }

  get equippedEquipments() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.EQUIPMENT && item.system.equipped)
  }

  /**
   * Retourneles Items de type equipment et de sous-type armor
   */
  get armors() {
    return this.equipments.filter((item) => item.system.subtype === SYSTEM.EQUIPMENT_SUBTYPE.ARMOR)
  }

  /**
   * Retourneles Items de type equipment et de sous-type shield
   */
  get shields() {
    return this.equipments.filter((item) => item.system.subtype === SYSTEM.EQUIPMENT_SUBTYPE.SHIELD)
  }

  /**
   * Retourneles Items de type equipment et de sous-type weapon
   */
  get weapons() {
    return this.equipments.filter((item) => item.system.subtype === SYSTEM.EQUIPMENT_SUBTYPE.WEAPON)
  }

  get misc() {
    return this.equipments.filter((item) => item.system.subtype === SYSTEM.EQUIPMENT_SUBTYPE.MISC)
  }

  /**
   * Retourneles Items équipés de type equipment et de sous-type armor
   */
  get equippedArmors() {
    return this.armors.filter((item) => item.system.equipped)
  }

  /**
   * Retourneles Items équipés de type equipment et de sous-type shield
   */
  get equippedShields() {
    return this.shields.filter((item) => item.system.equipped)
  }

  /**
   * RetourneToutes les actions de tous les objets
   */
  get actions() {
    let allActions = []
    this.items.forEach((item) => {
      if (item.actions.length > 0) allActions.push(...item.actions)
    })
    return allActions
  }

  /**
   * RetourneToutes les actions visibles des capacités et des équipements
   */
  get visibleActions() {
    let allActions = []
    this.items.forEach((item) => {
      if ([SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.CAPACITY].includes(item.type) && item.actions.length > 0) {
        allActions.push(...item.visibleActions)
      }
    })
    return allActions
  }

  /**
   * RetourneToutes les actions visibles et activables des capacités et des équipements
   */
  get visibleActivableActions() {
    return this.visibleActions.filter((a) => a.properties.activable)
  }

  /**
   * RetourneToutes les actions visibles, activables et temporaires des capacités et des équipements
   */
  get visibleActivableTemporaireActions() {
    return this.visibleActions.filter((a) => a.properties.activable && a.properties.temporary)
  }

  /**
   * RetourneToutes les actions visibles et non activables des capacités et des équipements
   */
  get visibleNonActivableActions() {
    return this.visibleActions.filter((a) => !a.properties.activable)
  }

  /**
   * RetourneToutes les actions visibles, non activables et non temporaires des capacités et des équipements
   */
  get visibleNonActivableNonTemporaireActions() {
    return this.visibleActions.filter((a) => !a.properties.activable && !a.properties.temporary)
  }

  /**
   * Get all the modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype AbilityValue
   * Retourne{Modifier[]} An empty array or an array of Modifiers
   */
  get abilitiesModifiers() {
    return this._getModifiersBySubtype(SYSTEM.MODIFIER_SUBTYPE.ABILITY)
  }

  /**
   * Retourne{Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Combat
   */
  get combatModifiers() {
    return this._getModifiersBySubtype(SYSTEM.MODIFIER_SUBTYPE.COMBAT_TYPE)
  }

  /**
   * Retourne{Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Attribute
   */
  get attributeModifiers() {
    return this._getModifiersBySubtype(SYSTEM.MODIFIER_SUBTYPE.ATTRIBUTE)
  }

  /**
   * Retourne{Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Skill
   */
  get skillModifiers() {
    return this._getModifiersBySubtype(SYSTEM.MODIFIER_SUBTYPE.SKILL)
  }

  /**
   * Retourne{Modifier[]} All the Trait or Capacity modifiers from Items of typeEquipment, Feature, Profile or Capacity with the subtype Resource
   */
  get resourceModifiers() {
    return this._getModifiersBySubtype(SYSTEM.MODIFIER_SUBTYPE.RESOURCE)
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true
    return false
  }

  // #endregion

  // #region méthodes publiques

  /**
   * Return all skill modifiers
   * @param {string} ability str, dex ...
   * Retourne{Object} Name, value, description
   */
  getSkillBonuses(ability) {
    const modifiersByTarget = this.skillModifiers.filter((m) => m.target === ability)
    let bonuses = []
    for (const modifier of modifiersByTarget) {
      const sourceInfos = modifier.getSourceInfos(this)
      bonuses.push({ name: sourceInfos.name, value: modifier.evaluate(this), description: sourceInfos.description })
    }
    return bonuses
  }

  /**
   * Retourne l'objet correspondant à la clé
   * @param {*} key
   */
  getEmbeddedItemByKey(key) {
    return this.items.find((item) => item.system.key === key)
  }

  /**
   * Retourne le malus à l'initiative lié à l'armure et à l'incompétence armes/armures
   *
   * Retourne{int} retourne le malus (négatif) ou 0
   */
  getMalusToInitiative() {
    return 0
    // Return this.getOverloadMalusToInitiative() + this.getIncompetentMalusToInitiative();
  }

  /**
   * Retourne le malus à l'initiative lié à l'armure
   *
   * Retourne{int} retourne le malus (négatif) ou 0 ; par défaut, retourne 0
   */
  getOverloadMalusToInitiative() {
    return 0
  }

  /**
   * Retourne le malus à l'initiative lié à l'incompétence armes/armures
   *
   * Retourne{int} retourne le malus (négatif) ou 0 ; par défaut, retourne 0
   */
  getIncompetentMalusToInitiative() {
    return 0
  }

  /**
   * Calcule la défense de l'armure et du bouclier équipés
   * Retourne {Int} la somme des DEF
   */
  getDefenceFromArmorAndShield() {
    return this.getDefenceFromArmor() + this.getDefenceFromShield()
  }

  /**
   * Calcule la défense de l'armure équipée
   * Retourne {Int} la valeur de défense
   */
  getDefenceFromArmor() {
    let protections = this.equippedArmors.map((i) => i.system.def)
    return this._addAllValues(protections)
  }

  /**
   * Retourne {Int} la valeur de défense
   */
  getDefenceFromShield() {
    let protections = this.equippedShields.map((i) => i.system.def)
    return this._addAllValues(protections)
  }

  /**
   *
   * @param {*} itemId
   */
  deleteItem(itemId) {
    const item = this.items.find((item) => item.id === itemId)
    switch (item.type) {
      case SYSTEM.ITEM_TYPE.CAPACITY:
      case SYSTEM.ITEM_TYPE.FEATURE:
        return this.deleteEmbeddedDocuments("Item", [itemId])
      default:
        break
    }
  }

  /**
   * Vérifie si le personnage est entraîné avec une arme
   * @param {*} itemId
   * @returns
   */
  isTrainedWithWeapon(itemId) {
    const item = this.weapons.find((item) => item.id === itemId)
    if (!item) return null
    const profile = this.system.profile
    if (!profile) return null
    const training = item.system.martialCategory
    return profile.system.martialTrainingsWeapons[training]
  }

  /**
   * Vérifie si le personnage est entraîné avec une armure
   * @param {*} itemId
   * @returns
   */
  isTrainedWithArmor(itemId) {
    const item = this.armors.find((item) => item.id === itemId)
    if (!item) return null
    const profile = this.system.profile
    if (!profile) return null
    const training = item.system.martialCategory
    return profile.system.martialTrainingsArmors[training]
  }

  /**
   * Vérifie si le personnage est entraîné avec un bouclier
   * @param {*} itemId
   * @returns
   */
  isTrainedWithShield(itemId) {
    const item = this.shields.find((item) => item.id === itemId)
    if (!item) return null
    const profile = this.system.profile
    if (!profile) return null
    const training = item.system.martialCategory
    return profile.system.martialTrainingsShields[training]
  }

  /**
   * Active ou désactive une action
   * @param {*} state true to enable the action, false to disable the action
   * @param {*} source  uuid of the embedded item which is the source of the action
   * @param {*} indice  indice of the action in the array of actions
     @param {string("attack","damage")} type  define if it's an attack or just a damage
   */
  async activateAction(state, source, indice, type) {
    const item = this.items.get(source)

    if (!item) return

    // Action avec une durée
    if (item.system.actions[indice].properties.temporary) {
      let newActions = foundry.utils.deepClone(item.system.actions)
      if (state) {
        newActions[indice].properties.enabled = true
      } else {
        newActions[indice].properties.enabled = false
      }

      const updateData = { _id: item.id, "system.actions": newActions }

      await this.updateEmbeddedDocuments("Item", [updateData])
    }
    // Action instantanée
    else {
      const action = Action.createFromExisting(item.system.actions[indice])
      // Recherche des resolvers de l'action
      let resolvers = Object.values(action.resolvers).map((a) => new Resolver(a.type, a.skill, a.dmg))
      for (const resolver of resolvers) {
        let res = resolver.resolve(this, item, action, type)
      }
    }
  }

  toggleSuperior(ability) {
    return (this.system.abilities[ability].superior = !this.system.abilities[ability].superior)
  }

  /**
   * Apprend/désapprend une capacité du personnage
   * Change le champ learned de la capactié
   * Met à jour le rank de la voie correspondante
   * @param {*} capacityId
   */
  async toggleCapacityLearned(capacityId) {
    // Mise à jour de la capacité et de ses actions
    await this._toggleItemFieldAndActions(capacityId, "learned")

    // Mise à jour du rang de la voie correspondante
    let path = this.items.get(this.items.get(capacityId).system.path)
    path.updateRank()
  }

  /**
   * Equippe/Déséquippe un equipment du personnage
   * Change le champ equipped de l'equipement
   * @param {*} itemId
   * @param {*} bypassChecks True to ignore the control of the hands
   */
  async toggleEquipmentEquipped(itemId, bypassChecks) {
    // Contrôle usage des mains
    let item = this.items.get(itemId)
    if (item.system.usage.oneHand || item.system.usage.twoHand) {
      if (!this.canEquipItem(item, bypassChecks)) return
    }

    // Mise à jour de l'item et de ses actions
    await this._toggleItemFieldAndActions(itemId, "equipped")
  }

  /**
   * Create a feature, and the linked modifiers, paths and capacities if they exist
   * @param {*} feature
   */
  async addFeature(feature) {
    let itemData = feature.toObject()
    itemData = itemData instanceof Array ? itemData : [itemData]
    const newFeature = await this.createEmbeddedDocuments("Item", itemData)
    // Console.info(Utils.log("Feature created", newFeature));

    // Update the source of all modifiers with the id of the new embedded feature created
    let newModifiers = Object.values(foundry.utils.deepClone(newFeature[0].system.modifiers)).map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value))
    newModifiers.forEach((modifier) => {
      modifier.updateSource(newFeature[0].id)
    })

    const updateModifiers = { _id: newFeature[0].id, "system.modifiers": newModifiers }

    await this.updateEmbeddedDocuments("Item", [updateModifiers])

    // Create all Paths
    let updatedPathsIds = []
    for (const path of feature.system.paths) {
      let originalPath = await fromUuid(path)

      // Item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (originalPath != null) {
        const newPathId = await this.addPath(originalPath)
        updatedPathsIds.push(newPathId)
      }
    }

    // Update the paths of the feature with ids of created paths
    const updatePaths = { _id: newFeature[0].id, "system.paths": updatedPathsIds }
    await this.updateEmbeddedDocuments("Item", [updatePaths])

    // Create all Capacities
    let updatedCapacitiesIds = []
    for (const capacity of feature.system.capacities) {
      let capa = await fromUuid(capacity)

      // Item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (capa != null) {
        const newCapacityId = await this.addCapacity(capa, null)
        updatedCapacitiesIds.push(newCapacityId)
      }
    }

    // Update the capacities of the feature with ids of created capacities
    const updateCapacities = { _id: newFeature[0].id, "system.capacities": updatedCapacitiesIds }
    await this.updateEmbeddedDocuments("Item", [updateCapacities])
  }

  /**
   * Create a profile, and the linked modifiers and paths if they exist
   * @param {*} profile
   */
  async addProfile(profile) {
    let itemData = profile.toObject()
    itemData = itemData instanceof Array ? itemData : [itemData]
    const newProfile = await this.createEmbeddedDocuments("Item", itemData)
    // Console.info(Utils.log("Profile created", newProfile));

    if (newProfile[0].system.modifiers.length > 0) {
      // Update the source of all modifiers with the id of the new embedded profile created
      let newModifiers = Object.values(foundry.utils.deepClone(newProfile[0].system.modifiers)).map((m) => new Modifier(m.source, m.type, m.subtype, m.target, m.value))
      newModifiers.forEach((modifier) => {
        modifier.updateSource(newProfile[0].id)
      })

      const updateModifiers = { _id: newProfile[0].id, "system.modifiers": newModifiers }

      await this.updateEmbeddedDocuments("Item", [updateModifiers])
    }

    // Create all Paths
    let updatedPathsIds = []
    for (const path of profile.system.paths) {
      let originalPath = await fromUuid(path)

      // Item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (originalPath != null) {
        const newPathId = await this.addPath(originalPath)
        updatedPathsIds.push(newPathId)
      }
    }

    // Update the paths of the profile with ids of created paths
    const updatePaths = { _id: newProfile[0].id, "system.paths": updatedPathsIds }
    await this.updateEmbeddedDocuments("Item", [updatePaths])

    // Update Hit Dice and Magick Attack base ability
    this.update({ "system.combat.magic.ability": profile.system.spellcasting })
  }

  /**
   * Add a path as an embedded item
   * It also create the capacities linked to the path
   * @param {CoItem} path
   * Retourne{number} id of the created path
   */
  async addPath(path) {
    let itemData = path.toObject()

    // Create the path
    itemData = itemData instanceof Array ? itemData : [itemData]
    const newPath = await this.createEmbeddedDocuments("Item", itemData)
    // Console.log("Path created : ", newPath);

    let updatedCapacitiesIds = []

    // Create all capacities
    for (const capacity of path.system.capacities) {
      let capa = await fromUuid(capacity)

      // Item is null if the item has been deleted in the compendium or in the world
      // TODO Add a warning message and think about a global rollback
      if (capa != null) {
        const newCapacityId = await this.addCapacity(capa, newPath[0].id)
        updatedCapacitiesIds.push(newCapacityId)
      }
    }

    // Update the array of capacities of the path with ids of created path
    const updateData = { _id: newPath[0].id, "system.capacities": updatedCapacitiesIds }
    await this.updateEmbeddedDocuments("Item", [updateData])

    return newPath[0].id
  }

  /**
   * Add a capacity as an embedded item
   * @param {CoItem} capacity
   * @param {number} pathId id of the Path if the capacity is linked to a path
   * Retourne{number} id of the created capacity
   */
  async addCapacity(capacity, pathId) {
    let capacityData = capacity.toObject()
    if (pathId !== null) capacityData.system.path = pathId

    // Learned the capacity if the capacity is not linked to a path
    if (pathId === null) capacityData.system.learned = true

    capacityData = capacityData instanceof Array ? capacityData : [capacityData]
    const newCapacity = await this.createEmbeddedDocuments("Item", capacityData)
    // Console.info(Utils.log("Capacity created", newCapacity))

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
        m.resolvers,
      )
      // Update the source and source's modifiers for the action
      action.updateSource(newCapacity[0].id)
      return action
    })

    const updateActions = { _id: newCapacity[0].id, "system.actions": newActions }
    await this.updateEmbeddedDocuments("Item", [updateActions])

    return newCapacity[0].id
  }

  /**
   * Add an equipment as an embedded item
   * @param {CoItem} equipment
   * Retourne{number} id of the created path
   */
  async addEquipment(equipment) {
    let equipmentData = equipment.toObject()
    equipmentData = equipmentData instanceof Array ? equipmentData : [equipmentData]

    // Création de l'objet
    const newEquipment = await this.createEmbeddedDocuments("Item", equipmentData)

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
          m.resolvers,
        )
        // Update the source and source's modifiers for the action
        action.updateSource(newEquipment[0].id)
        return action
      })

      const updateActions = { _id: newEquipment[0].id, "system.actions": newActions }
      await this.updateEmbeddedDocuments("Item", [updateActions])
    }
  }

  deleteFeature(featureId) {
    // Delete linked paths
    const pathsIds = this.items.get(featureId).system.paths
    for (const pathId of pathsIds) {
      this.deletePath(pathId)
    }
    // Delete linked capacities
    const capacitiesIds = this.items.get(featureId).system.capacities
    for (const capacityId of capacitiesIds) {
      this.deleteCapacity(capacityId)
    }
    this.deleteEmbeddedDocuments("Item", [featureId])
  }

  deleteProfile(profileId) {
    // Delete linked paths
    const pathsIds = this.items.get(profileId).system.paths
    for (const pathId of pathsIds) {
      this.deletePath(pathId)
    }
    this.deleteEmbeddedDocuments("Item", [profileId])
  }

  deletePath(pathId) {
    // Delete linked capacities
    const path = this.items.get(pathId)
    if (path) {
      const capacitiesId = path.system.capacities
      this.deleteEmbeddedDocuments("Item", capacitiesId)
      this.deleteEmbeddedDocuments("Item", [pathId])
    }
  }

  async deleteCapacity(capacityId) {
    // Remove the capacity from the capacities list of the linked Path
    const capacity = this.items.get(capacityId)

    if (capacity) {
      const pathId = capacity.system.path
      if (pathId != null) {
        // If the linked path still exists in the items
        if (this.items.get(pathId)) {
          let updatedCapacitiesIds = this.items.get(pathId).system.capacities.filter((id) => id !== capacityId)
          const updateData = { _id: pathId, "system.capacities": updatedCapacitiesIds }
          await this.updateEmbeddedDocuments("Item", [updateData])
        }
      }
      this.deleteEmbeddedDocuments("Item", [capacityId])
    }
  }

  // #endregion

  // #region méthodes privées

  /**
   * Calcul la somme d'un tableau de valeurs positives ou négatives
   *
   * @param {*} array Un tableau de valeurs
   * Retourne{int} 0 ou la somme des valeurs
   */
  _addAllValues(array) {
    return array.length > 0 ? array.reduce((acc, curr) => acc + curr, 0) : 0
  }

  /**
   * Toggle the field of the items and the actions linked
   * @param {*} itemId
   * @param {*} fieldName
   */
  async _toggleItemFieldAndActions(itemId, fieldName) {
    let item = this.items.get(itemId)
    let fieldValue = item.system[fieldName]
    await this.updateEmbeddedDocuments("Item", [{ _id: itemId, [`system.${fieldName}`]: !fieldValue }])
    if (item.actions.length > 0) {
      item.toggleActions()
    }
  }

  /**
   * Check if an item can be equiped, if one Hand or two Hands property is true
   * @param item
   * @param bypassChecks
   */
  canEquipItem(item, bypassChecks) {
    if (!this._hasEnoughFreeHands(item, bypassChecks)) {
      ui.notifications.warn(game.i18n.localize("CO.notif.NotEnoughFreeHands"))
      return false
    }
    return true
  }

  /**
   * Check if actor has enough free hands to equip this item
   * @param item
   * @param bypassChecks
   */
  _hasEnoughFreeHands(item, bypassChecks) {
    // Si le contrôle de mains libres n'est pas demandé, on renvoi Vrai
    let checkFreehands = game.settings.get("co", "checkFreeHandsBeforeEquip")
    if (!checkFreehands || checkFreehands === "none") return true

    // Si le contrôle est ignoré ponctuellement avec la touche MAJ, on renvoi Vrai
    if (bypassChecks && (checkFreehands === "all" || (checkFreehands === "gm" && game.user.isGM))) return true

    // Si l'objet est équipé, on tente de le déséquiper donc on ne fait pas de contrôle et on renvoi Vrai
    if (item.system.equipped) return true

    // Nombre de mains nécessaire pour l'objet que l'on veux équipper
    let neededHands = item.system.usage.twoHand ? 2 : 1

    // Calcul du nombre de mains déjà utilisées
    let itemsInHands = this.items.filter((item) => item.system.equipped)
    let usedHands = 0
    itemsInHands.forEach((item) => (usedHands += item.system.usage.twoHand ? 2 : 1))

    return usedHands + neededHands <= 2
  }

  _getModifiersBySubtype(subtype) {
    return [
      ...Modifiers.getModifiersByTypeSubtype(this.equipments, SYSTEM.MODIFIER_TYPE.EQUIPMENT, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.features, SYSTEM.MODIFIER_TYPE.FEATURE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.system.profiles, SYSTEM.MODIFIER_TYPE.PROFILE, subtype),
      ...Modifiers.getModifiersByTypeSubtype(this.capacities, SYSTEM.MODIFIER_TYPE.CAPACITY, subtype),
    ]
  }

  // #endregion

  // deleteItem(itemId) {
  //   const item = this.items.find(item => item.id === itemId);
  //
  //   switch (item.type) {
  //     case SYSTEM.ITEM_TYPE.PATH:
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
  //     case SYSTEM.ITEM_TYPE.CAPACITY:
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
