import { Stats } from "../system/stats.mjs";
import { ATTRIBUTE, COMBAT, EQUIPMENT_SUBTYPE, ITEM_TYPE, MODIFIER_SUBTYPE, MODIFIER_TYPE } from "../system/constants.mjs";
import { Modifiers } from "../system/modifiers.mjs";
import { Log } from "../utils/log.mjs";
import { Utils } from "../system/utils.mjs";

/**
 * Extend the base Actor entity
 * @extends {Actor}
 */
export default class CoActor extends Actor {
  /** @override */
  prepareBaseData() {
    return this._prepareCharacterData();
  }

  prepareDerivedData() {
    return this._prepareCharacterDerivedData();
  }

  /**
   * Perform any Character specific preparation.
   * @protected
   */
  _prepareCharacterData() {
    for (const [key, ability] of Object.entries(this.system.abilities)) {
      // ability.specie = (this.specie === undefined ? 0 : this.specie.getTotalModifiersByTypeAndTarget(MODIFIER_TYPE.SPECIE, key));
    }
  }

  /** @override */
  _prepareCharacterDerivedData() {
    for (const [key, ability] of Object.entries(this.system.abilities)) {
      // Log.debug(ability);
      const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr);
      const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key);

      ability.value = ability.base + bonuses + abilityModifiers.total;
      ability.tooltip = abilityModifiers.tooltip;

      ability.mod = Stats.getModFromValue(ability.value);
    }

    for (const [key, skill] of Object.entries(this.system.combat)) {
      // Log.debug(skill);
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr);
      const abilityBonus = skill.ability && this.system.abilities[skill.ability].mod ? this.system.abilities[skill.ability].mod : 0;

      if ([COMBAT.MELEE, COMBAT.RANGED, COMBAT.MAGIC].includes(key)) {
        const levelBonus = this.system.attributes.level.value ? this.system.attributes.level.value : 0;
        const combatModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key);
        // skill.value = skill.base + abilityBonus + levelBonus;
        skill.base = abilityBonus + levelBonus;
        skill.tooltipBase = Utils.getTooltip(game.i18n.localize('CO.label.long.level'),levelBonus) + Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus);
        skill.mod = skill.base + bonuses + combatModifiers.total;
        skill.tooltipMod = combatModifiers.tooltip;
      }

      if (key === COMBAT.INIT) {
        const abilityValue = skill.ability && this.system.abilities[skill.ability].value ? this.system.abilities[skill.ability].value : 0;
        const initModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key);
        const malus = this.getMalusToInitiative();
        skill.base = abilityValue;
        skill.value = skill.base + bonuses + initModifiers.total + malus;
        skill.tooltipBase = Utils.getTooltip(Utils.getAbilityName(skill.ability),abilityValue);
        skill.tooltipValue = initModifiers.tooltip;
      }

      if (key === COMBAT.DEF) {
        const defModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key);
        const protection = this.getDefenceFromArmorAndShield();
        skill.base = 10 + abilityBonus;
        skill.value = skill.base + bonuses + defModifiers.total + protection;
        skill.tooltipBase  = Utils.getTooltip("Base", 10) + Utils.getTooltip(Utils.getAbilityName(skill.ability),abilityBonus);
        skill.tooltipValue = defModifiers.tooltip;
      }

    }

    // HP Max
    const hpMaxBonuses = Object.values(this.system.attributes.hp.bonuses).reduce((prev, curr) => prev + curr);
    const hpMaxModifiers = Modifiers.computeTotalModifiersByTarget(this, this.attributeModifiers, ATTRIBUTE.HP);
    this.system.attributes.hp.max = this.system.attributes.hp.base + hpMaxBonuses + hpMaxModifiers.total;
    this.system.attributes.hp.tooltip = Utils.getTooltip("Base",this.system.attributes.hp.base) + hpMaxModifiers.tooltip;
  }

  /**
   * @returns undefined if no items or no items of specie type
   */
  // get specie() {
  //   if (this.items.size == 0) return undefined;
  //   return this.items.find(i => i.type === MODIFIER_TYPE.SPECIE);
  // }

  /**
   * @returns {Modifier[]} All the modifiers from Items of type Trait, Path or Capacity
   */
  get abilitiesModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ABILITY));

    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ABILITY));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ABILITY));

    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the modifiers from Items of type Trait, Path or Capacity
   */
  get combatModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.COMBAT));

    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.COMBAT));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.COMBAT));

    return modifiers;
  }

  /**
   * @returns {Modifier[]} All the modifiers from Items of type Trait, Path or Capacity
   */
  get attributeModifiers() {
    let modifiers = [];
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.TRAIT, MODIFIER_SUBTYPE.ATTRIBUTE));

    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.traits, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.paths, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ATTRIBUTE));
    modifiers.push(...Modifiers.getModifiersByTypeSubtype(this.capacities, MODIFIER_TYPE.CAPACITY, MODIFIER_SUBTYPE.ATTRIBUTE));

    return modifiers;
  }

  get traits() {
    return this.items.filter((item) => item.type == ITEM_TYPE.TRAIT);
  }

  get paths() {
    return this.items.filter((item) => item.type == ITEM_TYPE.PATH);
  }

  get capacities() {
    return this.items.filter((item) => item.type == ITEM_TYPE.CAPACITY);
  }

  get armors() {
    return this.items.filter((item) => item.type == ITEM_TYPE.EQUIPMENT && item.system.subtype == EQUIPMENT_SUBTYPE.ARMOR);
  }

  get shields() {
    return this.items.filter((item) => item.type == ITEM_TYPE.EQUIPMENT && item.system.subtype == EQUIPMENT_SUBTYPE.SHIELD);
  }

  get equippedArmors() {
    return this.armors.filter((item) => item.system.equipped);
  }

  get equippedShields() {
    return this.shields.filter((item) => item.system.equipped);
  }

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

  _addAllValues(array) {
    return array.length > 0 ? array.reduce((acc, curr) => acc + curr, 0) : 0;
  }
  // toggleCapacity(pathId, capacityKey, status) {
  //   const path = this.items.get(pathId);
  //   let capacities = duplicate(path.system.capacities);
  //
  //   let capacity = capacities.find((capacity) => capacity.key == capacityKey);
  //   capacity.selected = status;
  //
  //   const updateData = [{ _id: pathId, "system.capacities": capacities }];
  //
  //   // Add capacity
  //   if (status) {
  //     this._addCapacity(capacity.source);
  //   }
  //   // Remove capacity
  //   else {
  //     this._removeCapacity(capacityKey);
  //   }
  //
  //   this.updateEmbeddedDocuments("Item", updateData);
  // }
  //
  // async _addCapacity(capacitySource) {
  //   let document = await fromUuid(capacitySource);
  //   return this.createEmbeddedDocuments("Item", [document]);
  //
  // }
  //
  // _removeCapacity(capacityKey) {
  //   const capacity = this.capacities.find(capacity => capacity.system.key == capacityKey);
  //   if (!capacity) return;
  //   let capacityId = capacity._id;
  //   this.deleteEmbeddedDocuments("Item", [capacityId]);
  // }
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

  deleteItem(itemId) {
    const item = this.items.find((item) => item.id === itemId);

    switch (item.type) {
      case ITEM_TYPE.TRAIT:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
      case ITEM_TYPE.CAPACITY:
        return this.deleteEmbeddedDocuments("Item", [itemId]);
    }
  }
}
