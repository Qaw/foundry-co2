import CoActor from "./actor.mjs"
import CoChat from "../chat.mjs"
import { SYSTEM } from "../config/system.mjs"
import Utils from "../utils.mjs"
import DefaultConfiguration from "../configuration.mjs"

export default class CoCharacter extends CoActor {
  prepareDerivedData() {
    this._prepareAbilities()

    this._prepareHPMax()

    // Préparation des données de combat : Attaque de contact, attaque à distance, attaque magique, initiative, défense
    for (const [key, skill] of Object.entries(this.system.combat)) {
      // Somme du bonus de la feuille et du bonus des actives effects
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr)
      const abilityBonus = this.system.abilities[skill.ability].value

      if ([SYSTEM.COMBAT_TYPE.MELEE, SYSTEM.COMBAT_TYPE.RANGED, SYSTEM.COMBAT_TYPE.MAGIC].includes(key)) {
        this._prepareAttack(key, skill, abilityBonus, bonuses)
      }

      if (key === SYSTEM.COMBAT_TYPE.INIT) {
        this._prepareInit(skill, abilityBonus, bonuses)
      }

      if (key === SYSTEM.COMBAT_TYPE.DEF) {
        this._prepareDef(skill, abilityBonus, bonuses)
      }
    }

    for (const [key, skill] of Object.entries(this.system.resources)) {
      // Somme du bonus de la feuille et du bonus des actives effects
      const bonuses = Object.values(skill.bonuses).reduce((prev, curr) => prev + curr)

      // Points de chance  - Fortune Points - FP
      if (key === SYSTEM.RESOURCES_TYPE.FORTUNE) {
        this._prepareFP(skill, bonuses)
      }

      // Points de mana - Mana Points - MP
      if (key === SYSTEM.RESOURCES_TYPE.MANA) {
        this._prepareMP(skill, bonuses)
      }

      // Dés de récupération - Recovery Points - RP
      if (key === SYSTEM.RESOURCES_TYPE.RECOVERY) {
        this._prepareRP(skill, bonuses)
      }
    }

    // XP dépensés dans les capacités des voies
    this.system.attributes.xp.max = 2 * this.system.attributes.level
    this.system.attributes.xp.value = this._computeXP()
  }

  /**
   * Calcule la valeur et le mod des caractéristiques <br/>
   *              Valeur = base + bonus + modificateurs <br/>
   *              bonus est à la somme du bonus de la fiche et du champ dédié aux Active Effets <br/>
   *              modificateurs est la somme de tous les modificateurs modifiant la caractéristique, quelle que soit la source
   */
  _prepareAbilities() {
    for (const [key, ability] of Object.entries(this.system.abilities)) {
      // Somme du bonus de la feuille et du bonus des actives effects
      const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr)
      const abilityModifiers = this.system.computeTotalModifiersByTarget(this.system.abilityModifiers, key)

      ability.modifiers = abilityModifiers.total

      ability.value = ability.base + bonuses + ability.modifiers
      ability.tooltipValue = Utils.getTooltip(Utils.getAbilityName(key), ability.base).concat(abilityModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
    }
  }

  _prepareHPMax() {
    const constitutionBonus = this.system.attributes.level * this.system.abilities.con.value
    const hpMaxBonuses = Object.values(this.system.attributes.hp.bonuses).reduce((prev, curr) => prev + curr)
    const hpMaxModifiers = this.system.computeTotalModifiersByTarget(this.system.attributeModifiers, "hp")

    this.system.attributes.hp.max = this.system.attributes.hp.base + constitutionBonus + hpMaxBonuses + hpMaxModifiers.total
    this.system.attributes.hp.tooltip = Utils.getTooltip("Base", this.system.attributes.hp.base).concat(
      "Constitution : ",
      constitutionBonus,
      hpMaxModifiers.tooltip,
      Utils.getTooltip("Bonus", hpMaxBonuses),
    )
  }

  _prepareAttack(key, skill, abilityBonus, bonuses) {
    // Le bonus de niveau est limité à 10
    const levelBonus = Math.min(this.system.attributes.level, 10)
    const combatModifiers = this.system.computeTotalModifiersByTarget(this.system.combatModifiers, key)

    skill.base = abilityBonus + levelBonus
    skill.tooltipBase = Utils.getTooltip(game.i18n.localize("CO.label.long.level"), levelBonus).concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus))

    skill.value = skill.base + bonuses + combatModifiers.total
    skill.tooltipValue = skill.tooltipBase.concat(combatModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Dans COF : 10 + PER + Bonus Capacités
   * @param {*} skill
   * @param {*} abilityBonus
   * @param {*} bonuses
   */
  _prepareInit(skill, abilityBonus, bonuses) {
    const initModifiers = this.system.computeTotalModifiersByTarget(this.system.combatModifiers, SYSTEM.COMBAT_TYPE.INIT)
    const malus = this.getMalusToInitiative()

    skill.base = DefaultConfiguration.baseInitiative()
    skill.tooltipBase = Utils.getTooltip("Base", skill.base)

    skill.base += abilityBonus
    skill.tooltipBase = skill.tooltipBase.concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus))

    skill.value = skill.base + bonuses + initModifiers.total + malus
    skill.tooltipValue = skill.tooltipBase.concat(initModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))

    if (malus < 0) {
      skill.tooltipValue = skill.tooltipValue.concat(Utils.getTooltip("Malus", malus))
    }
  }

  /**
   * Calcule la défense
   * Dans COF : 10 + AGILITE + Modificateurs (Bonus Armure + Bonus Bouclier + Bonus Capacités)
   * @param {*} skill
   * @param {*} abilityBonus
   * @param {*} bonuses
   */
  _prepareDef(skill, abilityBonus, bonuses) {
    const defModifiers = this.system.computeTotalModifiersByTarget(this.system.combatModifiers, SYSTEM.COMBAT_TYPE.DEF)

    skill.base = DefaultConfiguration.baseDefense()
    skill.tooltipBase = Utils.getTooltip("Base", skill.base)

    skill.base += abilityBonus
    skill.tooltipBase = skill.tooltipBase.concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus))

    skill.value = skill.base + bonuses + defModifiers.total
    skill.tooltipValue = skill.tooltipBase.concat(defModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Calcule les points de chance
   * Dans COF : 2 + CHARISME + Modificateurs
   * Prepares the FP (Fortune Points) for a given skill by calculating its base value,
   * applying bonuses, and computing resource modifiers.
   *
   * @param {Object} skill The skill object to prepare FP for.
   * @param {number} bonuses The additional bonuses to apply to the skill's FP.
   */
  _prepareFP(skill, bonuses) {
    const baseFP = this._computeBaseFP()
    skill.base = baseFP.value
    skill.tooltipBase = baseFP.tooltip

    const resourceModifiers = this.system.computeTotalModifiersByTarget(this.system.resourceModifiers, SYSTEM.MODIFIERS_TARGET.fp.id)
    skill.max = skill.base + bonuses + resourceModifiers.total
    skill.tooltip = skill.tooltipBase.concat(resourceModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Computes the base FP (Force Points) for the character.
   *
   * The base FP is calculated as the sum of a base value (2), the character's charisma ability value,
   * and any additional FP from the character's family.
   * 2 + Charisma MOD + 1 (for the adventurer's family).
   *
   * @returns {Object} An object containing:
   *   - `value` {number}: The computed base FP value.
   *   - `tooltip` {string}: A tooltip string providing details on the components of the base FP.
   */
  _computeBaseFP() {
    const abilityBonus = this.system.abilities[this.system.resources.fortune.ability].value
    const baseFP = DefaultConfiguration.baseFortune()
    const value = baseFP + abilityBonus + this.system.fpFromFamily
    let tooltip = Utils.getTooltip("Base", baseFP)
    tooltip = tooltip.concat(Utils.getTooltip(Utils.getAbilityName(this.system.resources.fortune.ability), this.system.abilities.cha.value))
    if (this.system.fpFromFamily > 0) tooltip = tooltip.concat(Utils.getTooltip("Profil", this.system.fpFromFamily))
    return { value, tooltip }
  }

  /**
   * Calcule les points de mana
   * Dans COF : si le personnage a au moins un sort, VOLONTE + Nombre de sorts Modificateurs
   * Prepares the MP (Magic Points) for a given skill by calculating its base value,
   * applying resource modifiers, and adding any additional bonuses.
   *
   * @param {Object} skill The skill object to prepare MP for.
   * @param {number} bonuses Additional bonuses to be added to the skill's MP.
   */
  _prepareMP(skill, bonuses) {
    const baseMP = this._computeBaseMP()
    skill.base = baseMP.value
    skill.tooltipBase = baseMP.tooltip

    const resourceModifiers = this.system.computeTotalModifiersByTarget(this.system.resourceModifiers, SYSTEM.MODIFIERS_TARGET.mp.id)
    skill.max = skill.base + bonuses + resourceModifiers.total
    skill.tooltip = skill.tooltipBase.concat(resourceModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Computes the base MP (Magic Points) for the character.
   * Si le personnage a au moins une capacité signalée par un * (donc un sort), il a alors VOL + nb de sorts points de Mana
   * @returns {number} The base MP value. Returns 0 if the character has no spells.
   */
  _computeBaseMP() {
    let value = 0
    if (!this.hasSpells) return { value, tooltip: "Pas de sorts" }
    const nbSpells = this.nbSpells
    let tooltip = Utils.getTooltip("Nb de sorts", nbSpells)
    tooltip = tooltip.concat(Utils.getTooltip("Volonté", this.system.abilities.vol.value))
    return { value: this.system.abilities.vol.value + nbSpells, tooltip }
  }

  /**
   * Retrieves a list of spell items from the character's inventory : item of type capacity with property spell at true
   *
   * @returns {Array} An array of items that are of type 'CAPACITY' and are spells.
   */
  get spells() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.CAPACITY && item.system.isSpell)
  }

  /**
   * Checks if the character has any spells.
   *
   * @returns {boolean} True if the character has spells, otherwise false.
   */
  get hasSpells() {
    return this.spells.length > 0
  }

  /**
   * Gets the number of spells : item of type capacity with property spell at true
   *
   * @returns {number} The number of spells.
   */
  get nbSpells() {
    return this.spells.length
  }

  /**
   * Prepares the RP (Resource Points) for a given skill by computing its base value,
   * applying resource modifiers, and adding any additional bonuses.
   *
   * @param {Object} skill The skill object to prepare RP for.
   * @param {number} bonuses Additional bonuses to be added to the skill's RP.
   */
  _prepareRP(skill, bonuses) {
    const baseRP = this._computeBaseRP()
    skill.base = baseRP.value
    skill.tooltipBase = baseRP.tooltip

    const resourceModifiers = this.system.computeTotalModifiersByTarget(this.system.resourceModifiers, SYSTEM.MODIFIERS_TARGET.rp.id)
    skill.max = skill.base + bonuses + resourceModifiers.total
    skill.tooltip = skill.tooltipBase.concat(resourceModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Computes the base RP (Resource Points) for the character.
   *
   * The base RP is calculated as the sum of:
   * - A constant value of 2
   * - The character's Constitution ability value
   * - The RP value from the character's family : 1 dé supplémentaire pour la famille des mystiques
   *
   * @returns {number} The computed base RP value.
   */
  _computeBaseRP() {
    const baseRP = DefaultConfiguration.baseRecovery()
    const value = baseRP + this.system.abilities.con.value + this.system.rpFromFamily
    let tooltip = Utils.getTooltip("Base", baseRP)
    tooltip = tooltip.concat(Utils.getTooltip("Constitution", this.system.abilities.con.value))
    if (this.system.rpFromFamily > 0) tooltip = tooltip.concat(Utils.getTooltip("Profil", this.system.rpFromFamily))
    return { value, tooltip }
  }

  // #region accesseurs

  /**
   * Gets the hit dice (hd) for the character : it's the recovery dice value from the character's profile
   *
   * @returns {number|undefined} The recovery dice value from the character's profile system, or undefined if not available.
   */
  get hd() {
    return this.system.profile?.system.recoveryDice ?? undefined
  }

  /**
   * Retourne Toutes les actions visibles des capacités et des équipements sous forme d'un tableau d'actions
   */
  async getVisibleActions() {
    let allActions = [];
    for (const item of this.items) {
        if ([SYSTEM.ITEM_TYPE.EQUIPMENT, SYSTEM.ITEM_TYPE.CAPACITY].includes(item.type) && item.actions.length > 0) {
            const itemActions = await item.getVisibleActions();
            allActions.push(...itemActions);
        }
    }
    return allActions;
}

  // #endregion

  useRecovery(withHpRecovery) {
    if (this.system.resources.recovery.value <= 0) return
    let hp = this.system.attributes.hp
    let rp = this.system.resources.recovery
    const level = this.system.attributes.level.max
    const modCon = this.system.abilities.con.mod
    console.log("level", level, "mod", modCon)
    if (!withHpRecovery) {
      rp.value -= 1
      this.update({ "system.resources.recovery": rp })
    } else {
      Dialog.confirm({
        title: game.i18n.format("CO.dialogs.spendRecoveryPoint.title"),
        content: game.i18n.localize("CO.dialogs.spendRecoveryPoint.content"),
        yes: async () => {
          const hd = this.hd
          const bonus = level + modCon
          const formula = `${hd} + ${bonus}`
          console.log("formula", formula)
          const roll = await new Roll(formula, {}).roll({ async: true })
          const toolTip = new Handlebars.SafeString(await roll.getTooltip())

          await new CoChat(this)
            .withTemplate("systems/co/templates/chat/healing-card.hbs")
            .withData({
              actorId: this.id,
              title: game.i18n.localize("CO.dialogs.spendRecoveryPoint.rollTitle"),
              formula: formula,
              total: roll.total,
              toolTip: toolTip,
            })
            .withRoll(roll)
            .create()

          hp.value += roll.total
          if (hp.value > hp.max) hp.value = hp.max
          rp.value -= 1
          this.update({ "system.resources.recovery": rp, "system.attributes.hp": hp })
        },
        defaultYes: false,
      })
    }
  }

  _computeXP() {
    const paths = this.paths
    let xp = 0
    paths.forEach((path) => {
      const rank = path.system.rank
      if (rank > 0 && rank <= 2) xp += rank
      else if (rank > 2) xp += rank * 2 - 2

      // Const capacities = path.system.capacities;
      // for (let index = 0; index < rank; index++) {
      //   let capacity = this.items.get(capacities[index]);
      //   if (capacity.system.learned) {
      //     if (index === 0 || index === 1) xp += 1;
      //     else xp +=2;
      //   }
      // }
    })
    // Console.log('Compute XP : ', xp);
    return xp
  }
}
