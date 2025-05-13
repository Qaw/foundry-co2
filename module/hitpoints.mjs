export class Hitpoints {
  static applyToTargets(amount, drChecked, tempDamage) {
    // On prend les cibles s'il y en a, sinon on prend les tokens actifs.
    // notation [...] transforme un Set en Array
    let targets = [...game.user.targets].length > 0 ? [...game.user.targets] : canvas.tokens.objects.children.filter((t) => t._controlled)
    if (targets.length === 0) {
      ui.notifications.warn(game.i18n.localize("CO.notif.warningApplyDamageNoTarget"))
    } else {
      for (let target of targets) {
        let currentHp = foundry.utils.duplicate(target.actor.system.attributes.hp.value)
        let currentMaxHp = foundry.utils.duplicate(target.actor.system.attributes.hp.max)
        let currentTempDamage = foundry.utils.duplicate(target.actor.system.attributes.tempHp)

        let finalAmount = amount
        // Dommages
        if (amount < 0) {
          // Application de la RD si c'est cochée
          if (drChecked) finalAmount += target.actor.system.combat.dr.value
          if (finalAmount > -1) finalAmount = -1
        }
        if (tempDamage) {
          let newTempDamage = currentTempDamage + Math.abs(finalAmount)
          if (newTempDamage > currentMaxHp) newTempDamage = currentMaxHp
          target.actor.update({ "system.attributes.tempHp": newTempDamage })
          // Si les dmg temporaire sont egaux au hp max on le met inconscient
          if (newTempDamage === currentMaxHp) {
            target.actor.toggleStatusEffect("unconscious", true)
          }
        } else {
          let newHp = currentHp + finalAmount
          if (newHp > target.actor.system.attributes.hp.max) newHp = target.actor.system.attributes.hp.max
          if (newHp < 0) newHp = 0
          // Si on a les DM temporaire + DM letaux > HP max on met les PV à 0
          if (currentTempDamage + Math.abs(finalAmount) > currentMaxHp) {
            newHp = 0
            if (target.actor.type !== "character") target.actor.toggleStatusEffect("dead", true)
          }

          target.actor.update({ "system.attributes.hp.value": newHp })
        }
      }
    }
  }

  /**
   * Handles the click event for the chat message apply button.
   *
   * @param {Event} event The click event triggered by the user.
   * @param {jQuery} html The jQuery object representing the HTML content.
   * @param {Object} data Additional data passed to the function.
   */
  static onClickChatMessageApplyButton(event, html, data) {
    const dataset = event.currentTarget.dataset
    const type = dataset.apply
    const dmg = parseInt(dataset.total)
    const tempDamage = dataset.tempdamage === "true"
    console.log("onClickChatMessageApplyButton. data : ", data)
    console.log("onClickChatMessageApplyButton. type : ", type)
    console.log("onClickChatMessageApplyButton. dmg : ", dmg)
    console.log("onClickChatMessageApplyButton. dataset : ", dataset)
    const drChecked = html.find("#dr").is(":checked")
    switch (type) {
      case "full":
        Hitpoints.applyToTargets(-dmg, drChecked, tempDamage)
        break
      case "half":
        Hitpoints.applyToTargets(-Math.ceil(dmg / 2), drChecked, tempDamage)
        break
      case "double":
        Hitpoints.applyToTargets(-dmg * 2, drChecked, tempDamage)
        break
      case "heal":
        Hitpoints.applyToTargets(dmg, drChecked, false)
        break
    }
  }
}
