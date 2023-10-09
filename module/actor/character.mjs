import CoActor from "./actor.mjs";
import { COMBAT, RESOURCES } from "../system/constants.mjs";
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
  }

  get hd() {
    const profile = this.profile[0];
    if (profile) return profile.system.hd;
    return undefined;
  }

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
}
