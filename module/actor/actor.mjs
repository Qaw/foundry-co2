import { Stats } from "../system/stats.mjs";
import { ATTRIBUTE, COMBAT, EQUIPMENT_SUBTYPE, ITEM_TYPE, MODIFIER_SUBTYPE, MODIFIER_TARGET, MODIFIER_TYPE, RESOURCES } from "../system/constants.mjs";
import { Modifiers } from "../system/modifiers.mjs";
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
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ABILITY));
    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Combat
   */
  get combatModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.COMBAT));    
    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Attribute
   */
  get attributeModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ATTRIBUTE));    
    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of type Equipment, Feature, Profile or Capacity with the subtype Skill
   */
  get skillModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, MODIFIER_SUBTYPE.SKILL));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, MODIFIER_SUBTYPE.SKILL));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, MODIFIER_SUBTYPE.SKILL));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.SKILL));       
    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the Trait or Capacity modifiers from Items of typeEquipment, Feature, Profile or Capacity with the subtype Resource
   */
  get resourceModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.equipments, MODIFIER_TYPE.EQUIPMENT, MODIFIER_SUBTYPE.RESOURCE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.features, MODIFIER_TYPE.FEATURE, MODIFIER_SUBTYPE.RESOURCE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.profile, MODIFIER_TYPE.PROFILE, MODIFIER_SUBTYPE.RESOURCE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.RESOURCE));     
    return modifiers;
  }

  /**
   * @returns les Items de type equipment
   */
  get equipments() {
    return this.items.filter((item) => item.type == ITEM_TYPE.EQUIPMENT);
  }  

  /**
   * @returns les Items de type feature
   */
  get features() {
    return this.items.filter((item) => item.type == ITEM_TYPE.FEATURE);
  }

  /**
 * @returns le premier Item de type profile
 */
  get profile() {
    return this.items.find((item) => item.type === ITEM_TYPE.PROFILE) ?? null;
  }

  get paths() {
    return this.items.filter((item) => item.type == ITEM_TYPE.PATH);
  }

  get capacities() {
    return this.items.filter((item) => item.type == ITEM_TYPE.CAPACITY);
  }

  get enabledCapacities() {
    return this.items.filter((item) => item.type == ITEM_TYPE.CAPACITY && item.system.properties.enabled);
  }

  /**
   * @returns les Items de type equipment et de sous-type armor
   */
  get armors() {
    return this.equipments.filter((item) => item.system.subtype == EQUIPMENT_SUBTYPE.ARMOR);
  }

  /**
   * @returns les Items de type equipment et de sous-type shield
   */
  get shields() {
    return this.equipments.filter((item) => item.system.subtype == EQUIPMENT_SUBTYPE.SHIELD);
  }

  /**
   * @returns les Items de type equipment et de sous-type weapon
   */
  get weapons() {
    return this.equipments.filter((item) => item.system.subtype == EQUIPMENT_SUBTYPE.WEAPON);
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
    this.items.forEach(item => {
      if (item.actions.length > 0) allActions.push(...item.actions);
    });
    return allActions;
  }

  /**
   * @returns Toutes les actions visibles de tous les objets
   */
  get visibleActions() {
    let allActions = [];
    this.items.forEach(item => {
      if (item.type == ITEM_TYPE.CAPACITY && item.system.properties.enabled && item.actions.length > 0) {
        allActions.push(...item.visibleActions);
      }
      else if (item.actions.length > 0) allActions.push(...item.visibleActions);
    });
    return allActions;
  }
  //#endregion

  //#region méthodes publiques

  /** @override */
  prepareBaseData() {
    return this._prepareCharacterData();
  }

  prepareDerivedData() {
    return this._prepareCharacterDerivedData();
  }

  /**
   * Return all skill modifiers
   * @param {String} ability str, dex ...
   * @returns {Object} Name, value, description
   */
  getSkillBonuses(ability) {
    const modifiersByTarget = this.skillModifiers.filter((m) => m.target === ability);
    let bonuses = [];
    modifiersByTarget.forEach((modifier) => {
      bonuses.push({ name: modifier.sourceName, value: modifier.evaluate(this), description: modifier.sourceDescription });
    });
    return bonuses;
  }

  /**
   *
   * @param {*} key
   * @returns l'objet correspondant à la clé
   */
  getEmbeddedItemByKey(key) {
    return this.items.find((item) => item.system.key == key);
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
      case ITEM_TYPE.TRAIT:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
      case ITEM_TYPE.CAPACITY:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
      case ITEM_TYPE.FEATURE:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
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
    if (!profile) return null;
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
    if (!profile) return null;
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
    if (!profile) return null;
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
    let newActions = foundry.utils.deepClone(item.system.actions);
    if (state) {
      newActions[indice].properties.enabled = true;
    }
    else {
      newActions[indice].properties.enabled = false;
    }

    const updateData = {"_id" : item.id, "system.actions": newActions};

    await this.updateEmbeddedDocuments("Item", [updateData]);
  }
  //#endregion

  //#region méthodes privées

  /**
   * Perform any Character specific preparation.
   * @protected
   */
  _prepareCharacterData() {}

  /** @override */
  _prepareCharacterDerivedData() {
    this._prepareAbilities();

    for (const [key, skill] of Object.entries(this.system.combat)) {
      // Log.debug(skill);
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
    const formula = this.profile?.system.mpFormula;
    total = formula ? Utils.evaluate(this, formula, null) : 0;
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
    const protection = this.getDefenceFromArmorAndShield();

    skill.base = game.settings.get("co", "baseDef");
    skill.tooltipBase = Utils.getTooltip("Base", skill.base);

    skill.base += abilityBonus;
    skill.tooltipBase += Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus);

    skill.value = skill.base + bonuses + defModifiers.total + protection;
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
  //#endregion

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
