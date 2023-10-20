import CoActor from "./actor.mjs";
import { COMBAT, ITEM_TYPE, RESOURCES } from "../system/constants.mjs";
import { CoChat } from "../ui/chat.mjs";

export default class CoCharacter extends CoActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    this._prepareAbilities();
    this._prepareHPMax();

    for (const [key, skill] of Object.entries(this.system.combat)) {
      // console.debug(skill);
      // Somme du bonus de la feuille et du bonus des effets
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

    // Level max
    const levelBonuses = Object.values(this.system.attributes.level.bonuses).reduce((prev, curr) => prev + curr);
    this.system.attributes.level.max = this.system.attributes.level.base + levelBonuses;

    // XP dépensés dans les capacités des voies
    this.system.attributes.xp.max = 2 * this.system.attributes.level.max;
    this.system.attributes.xp.value = this._computeXP();

  }

  //#region accesseurs

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

  get hd() {
    const profile = this.profile[0];
    if (profile) return profile.system.hd;
    return undefined;
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
  
  useRecovery(withHpRecovery) {
    if (!this.system.resources.recovery.value > 0) return;
    let hp = this.system.attributes.hp;
    let rp = this.system.resources.recovery;
    const level = this.system.attributes.level.max;
    const modCon = this.system.abilities.con.mod;
    console.log("level", level, "mod", modCon);
    if (!withHpRecovery) {
      rp.value -= 1;
      this.update({ "system.resources.recovery": rp });
    } else {
      Dialog.confirm({
        title: game.i18n.format("CO.dialogs.spendRecoveryPoint.title"),
        content: game.i18n.localize("CO.dialogs.spendRecoveryPoint.content"),
        yes: async () => {
          const hd = this.hd;
          const bonus = level + modCon;
          const formula = `${hd} + ${bonus}`;
          console.log("formula", formula);
          const roll = await new Roll(formula, {}).roll({ async: true });
          const toolTip = new Handlebars.SafeString(await roll.getTooltip());
          
          await new CoChat(this)
            .withTemplate("systems/co/templates/chat/healing-card.hbs")
            .withData({
              actorId: this.id,
              title: game.i18n.localize("CO.dialogs.spendRecoveryPoint.rollTitle"),
              formula: formula,
              total: roll.total,
              toolTip: toolTip
            })
            .withRoll(roll)
            .create();

          hp.value += roll.total;
          if (hp.value > hp.max) hp.value = hp.max;
          rp.value -= 1;
          this.update({"system.resources.recovery": rp, "system.attributes.hp": hp});          
        },
        defaultYes: false,
      });
    }
  }

  _computeXP() {
    const paths = this.paths;
    let xp = 0;
    paths.forEach(path => {
      const rank = path.system.rank;
      if(rank > 0 && rank <= 2) xp += rank
      else if(rank > 2) xp += rank * 2 - 2

      // const capacities = path.system.capacities;
      // for (let index = 0; index < rank; index++) {
      //   let capacity = this.items.get(capacities[index]);
      //   if (capacity.system.learned) {
      //     if (index === 0 || index === 1) xp += 1;
      //     else xp +=2;
      //   }
      // }
    });
    // console.log('Compute XP : ', xp);
    return xp;
  }
}
