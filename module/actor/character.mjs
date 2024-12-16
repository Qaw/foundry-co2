import CoActor from "./actor.mjs"
import CoChat from "../chat.mjs"
import { SYSTEM } from "../config/system.mjs"
import { Modifiers } from "../models/action/modifiers.mjs"
import Utils from "../utils.mjs"

export default class CoCharacter extends CoActor {
  prepareDerivedData() {
    this._prepareAbilities()

    this._prepareHPMax()

    // Préparation des données de combat : Attaque de contact, attaque à distance, attaque magique, initiative, défense
    for (const [key, skill] of Object.entries(this.system.combat)) {
      // Somme du bonus de la feuille et du bonus des effets
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
      const bonuses = Object.values(ability.bonuses).reduce((prev, curr) => prev + curr)
      const abilityModifiers = Modifiers.computeTotalModifiersByTarget(this, this.abilitiesModifiers, key)
      ability.modifiers = abilityModifiers.total

      ability.value = ability.base + bonuses + ability.modifiers
      ability.tooltipValue = Utils.getTooltip(Utils.getAbilityName(key), ability.base).concat(abilityModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
    }
  }

  _prepareHPMax() {
    const constitutionBonus = this.system.attributes.level * this.system.abilities.con.value
    const hpMaxBonuses = Object.values(this.system.attributes.hp.bonuses).reduce((prev, curr) => prev + curr)
    const hpMaxModifiers = Modifiers.computeTotalModifiersByTarget(this, this.attributeModifiers, SYSTEM.ATTRIBUTE.HP)
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
    const combatModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, key)

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
    const initModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, SYSTEM.COMBAT_TYPE.INIT)
    const malus = this.getMalusToInitiative()

    skill.base = this.baseInitiative
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
   * Dans COF : 10 + AGI + Modificateurs (Bonus Armure + Bonus Bouclier + Bonus Capacités)
   * @param {*} skill
   * @param {*} abilityBonus
   * @param {*} bonuses
   */
  _prepareDef(skill, abilityBonus, bonuses) {
    const defModifiers = Modifiers.computeTotalModifiersByTarget(this, this.combatModifiers, SYSTEM.COMBAT_TYPE.DEF)

    skill.base = this.baseDefense
    skill.tooltipBase = Utils.getTooltip("Base", skill.base)

    skill.base += abilityBonus
    skill.tooltipBase = skill.tooltipBase.concat(Utils.getTooltip(Utils.getAbilityName(skill.ability), abilityBonus))

    skill.value = skill.base + bonuses + defModifiers.total
    skill.tooltipValue = skill.tooltipBase.concat(defModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  _prepareFP(skill, bonuses) {
    skill.base = this._computeBaseFP()
    skill.tooltipBase = Utils.getTooltip("Base", skill.base)

    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, SYSTEM.MODIFIER_TARGET.FP)
    skill.max = skill.base + bonuses + resourceModifiers.total
    skill.tooltip = skill.tooltipBase.concat(resourceModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Computes the base FP (Force Points) for a character.
   *
   * The base FP is calculated as:
   * 2 + Charisma MOD + 1 (for the adventurer's family).
   *
   * @returns {number} The computed base FP.
   */
  _computeBaseFP() {
    return 2 + this.system.abilities.cha.value + this.system.fpFromFamily
  }

  /**
   * Prepares the MP (Magic Points) for a given skill by calculating its base value,
   * applying resource modifiers, and adding any additional bonuses.
   *
   * @param {Object} skill - The skill object to prepare MP for.
   * @param {number} bonuses - Additional bonuses to be added to the skill's MP.
   */
  _prepareMP(skill, bonuses) {
    skill.base = this._computeBaseMP()
    skill.tooltipBase = Utils.getTooltip("Base", skill.base)

    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, SYSTEM.MODIFIER_TARGET.MP)
    skill.max = skill.base + resourceModifiers.total + bonuses
    skill.tooltip = skill.tooltipBase.concat(resourceModifiers.tooltip, Utils.getTooltip("Bonus", bonuses))
  }

  /**
   * Computes the base MP (Magic Points) for the character.
   * Si le personnage a au moins une capacité signalée par un * (donc un sort), il a alors VOL + nb de sorts points de Mana
   * @returns {number} The base MP value. Returns 0 if the character has no spells.
   */
  _computeBaseMP() {
    if (!this.hasSpells) return 0
    const nbSpells = this.nbSpells
    return this.system.abilities.vol.value + nbSpells
  }

  /**
   * Retrieves a list of spell items from the character's inventory : item of type capacity with property spell at true
   *
   * @returns {Array} An array of items that are of type 'CAPACITY' and are spells.
   */
  get spells() {
    return this.items.filter((item) => item.type === SYSTEM.ITEM_TYPE.CAPACITY && item.system.isSpell)
  }

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

  _prepareRP(skill, bonuses) {
    skill.base = this._computeBaseRP()
    const resourceModifiers = Modifiers.computeTotalModifiersByTarget(this, this.resourceModifiers, SYSTEM.MODIFIER_TARGET.RP)

    skill.max = skill.base + resourceModifiers.total + bonuses
  }

  // (2 + Modificateur de Constitution) Dés de récupération
  // 1 dé supplémentaire pour la famille des mystiques
  _computeBaseRP() {
    return 2 + this.system.abilities.con.value + this.system.rpFromFamily
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
   * @returns Toutes les actions visibles des capacités et des équipements
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
