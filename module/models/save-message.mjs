import BaseMessageData from "./base-message.mjs"
import CustomEffectData from "./schemas/custom-effect.mjs"
import { CORoll } from "../documents/roll.mjs"
import { Resolver } from "./schemas/resolver.mjs"
import Utils from "../helpers/utils.mjs"
import SaveRollHandler from "../helpers/save-roll.mjs"

export default class SaveMessageData extends BaseMessageData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      ability: new fields.StringField({ required: true }),
      difficulty: new fields.StringField({ required: true }),
      difficultyFormula: new fields.StringField({ required: false, nullable: true, blank: true }),
      result: new fields.ObjectField(),
      customEffect: new fields.EmbeddedDataField(CustomEffectData),
      additionalEffect: new fields.SchemaField({
        active: new fields.BooleanField({ initial: false }),
        applyOn: new fields.StringField({ required: true, choices: SYSTEM.RESOLVER_RESULT, initial: SYSTEM.RESOLVER_RESULT.success.id }),
        successThreshold: new fields.NumberField({ integer: true, positive: true }),
        statuses: new fields.SetField(new fields.StringField({ required: true, blank: true, choices: SYSTEM.RESOLVER_ADDITIONAL_EFFECT_STATUS })),
        duration: new fields.StringField({ required: true, nullable: false, initial: "0" }),
        unit: new fields.StringField({ required: true, choices: SYSTEM.COMBAT_UNITE, initial: SYSTEM.COMBAT_UNITE.round.id }),
        formula: new fields.StringField({ required: false }),
        formulaType: new fields.StringField({ required: false, choices: SYSTEM.RESOLVER_FORMULA_TYPE }),
        elementType: new fields.StringField({ required: false }),
      }),
      showButton: new fields.BooleanField({ initial: true }),
      targetResults: new fields.ArrayField(
        new fields.SchemaField({
          uuid: new fields.StringField({ required: false, nullable: true, blank: true }),
          name: new fields.StringField({ required: false, nullable: true, blank: true }),
          img: new fields.StringField({ required: false, nullable: true, blank: true }),
          needsSaveRoll: new fields.BooleanField({ initial: true }),
          total: new fields.NumberField({ required: false, nullable: true, integer: true }),
          isSuccess: new fields.BooleanField({ initial: false }),
          isFailure: new fields.BooleanField({ initial: false }),
          isCritical: new fields.BooleanField({ initial: false }),
          isFumble: new fields.BooleanField({ initial: false }),
          saveActorId: new fields.StringField({ required: false, nullable: true, blank: true }),
          saveHasLuckyPoints: new fields.BooleanField({ initial: false }),
          rollFormula: new fields.StringField({ required: false, nullable: true, blank: true }),
          rollTooltip: new fields.StringField({ required: false, nullable: true, blank: true }),
        }),
        { required: false, initial: [] },
      ),
    })
  }

  /**
   * Modifie le contenu HTML d'un message
   * @async
   * @param {COChatMessage} message Le document ChatMessage en cours de rendu.
   * @param {HTMLElement} html Element HTML representant le message a modifier.
   * @returns {Promise<void>} Resout lorsque le HTML a ete mis a jour.
   */
  async alterMessageHTML(message, html) {
    const hasTargetResults = (message.system.targetResults?.length ?? 0) > 0

    if (hasTargetResults) {
      this._buildMultiTargetHTML(message, html)
      return
    }

    // Legacy (single target)
    const targetsSection = html.querySelector(".targets")
    if (!targetsSection) return

    if (this.targetType !== SYSTEM.RESOLVER_TARGET.none.id) {
      const targetActors = Array.from(message.system.targets)
      if (targetActors.length > 0) {
        const targetList = document.createElement("ul")
        targetList.classList.add("target-list")
        targetActors.forEach((actorUuid) => {
          const actor = fromUuidSync(actorUuid)
          if (!actor) return
          const listItem = document.createElement("li")
          const img = document.createElement("img")
          img.src = actor.img
          img.classList.add("target-actor-img")
          listItem.appendChild(img)
          const name = document.createElement("span")
          name.textContent = actor.name
          name.classList.add("name-stacked")
          listItem.appendChild(name)
          targetList.appendChild(listItem)
        })
        targetsSection.appendChild(targetList)
      }
    } else {
      targetsSection.remove()
    }

    const displayDifficulty = game.settings.get("co2", "displayDifficulty")
    if (displayDifficulty === "gm" && !game.user.isGM) {
      const element = html.querySelector(".display-difficulty")
      if (element) element.remove()
    }

    if (this.showButton) {
      const totalDiv = html.querySelector(".save-total")
      if (totalDiv) totalDiv.innerHTML = `<i class="fa-solid fa-square-question"></i>`
      const footer = html.querySelector(".card-footer")
      if (footer) footer.remove()
      const luckyPointsDiv = html.querySelector(".lucky-points")
      if (luckyPointsDiv) luckyPointsDiv.remove()
    } else {
      const button = html.querySelector(".save-roll")
      if (button) button.remove()
      const totalDiv = html.querySelector(".save-total")
      if (totalDiv) {
        totalDiv.innerHTML = `<div>${this.result.total}</div>`
        totalDiv.setAttribute("data-tooltip", `${game.i18n.localize("CO.ui.total")}`)
        totalDiv.setAttribute("data-tooltip-direction", "LEFT")
      }
      const footerFormula = html.querySelector(".footer-formula")
      if (footerFormula) footerFormula.innerText = this.parent.rolls[0].formula
      const footerTooltip = html.querySelector(".footer-tooltip")
      if (footerTooltip) footerTooltip.innerHTML = this.parent.rolls[0].options.toolTip

      const targetUuid = this.targets[0]
      const currentUserActor = game.user.character
      const currentUserActorUuid = currentUserActor ? currentUserActor.uuid : null
      const hasLuckyPoints = currentUserActor?.system?.resources?.fortune?.value > 0
      if (this.result.isCritical || currentUserActorUuid !== targetUuid || currentUserActor?.type !== "character" || !hasLuckyPoints) {
        const luckyPointsDiv = html.querySelector(".lucky-points")
        if (luckyPointsDiv) luckyPointsDiv.remove()
      }
    }
  }

  /**
   * Ajoute les listeners du message
   * @async
   * @param {HTMLElement} html Element HTML representant le message a modifier.
   */
  async addListeners(html) {
    const hasTargetResults = (this.targetResults?.length ?? 0) > 0

    if (hasTargetResults) {
      this._addMultiTargetListeners(html)
      return
    }

    this._addLegacyListeners(html)
  }

  // ----------------------------------------------------------------
  //  Multi-cible : construction du HTML des lignes cibles
  // ----------------------------------------------------------------

  _buildMultiTargetHTML(message, html) {
    const displayDifficulty = game.settings.get("co2", "displayDifficulty")
    const showDifficulty = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM)

    if (displayDifficulty === "gm" && !game.user.isGM) {
      html.querySelectorAll(".display-difficulty").forEach((el) => el.remove())
    }

    const targetsSection = html.querySelector(".targets")
    if (!targetsSection) return

    targetsSection.innerHTML = ""

    const targetResults = message.system.targetResults ?? []
    if (targetResults.length === 0) return

    const details = document.createElement("details")
    details.classList.add("targets-collapsible")
    details.open = true

    const summary = document.createElement("summary")
    summary.classList.add("targets-header")
    summary.innerHTML = `<i class="fa-solid fa-bullseye-arrow"></i> ${game.i18n.localize("CO.ui.targets")}`
    details.appendChild(summary)

    const ul = document.createElement("ul")
    ul.classList.add("target-list")

    for (const tr of targetResults) {
      const li = document.createElement("li")
      li.classList.add("target-row")
      li.dataset.targetUuid = tr.uuid

      // Icone d'etat
      if (showDifficulty) {
        const outcomeSpan = document.createElement("span")
        if (tr.needsSaveRoll) {
          outcomeSpan.className = "target-outcome pending"
          outcomeSpan.dataset.tooltip = game.i18n.localize("CO.ui.saves")
          outcomeSpan.dataset.tooltipDirection = "LEFT"
          outcomeSpan.innerHTML = `<i class="fas fa-question"></i>`
        } else if (tr.isCritical) {
          outcomeSpan.className = "target-outcome success critical"
          outcomeSpan.dataset.tooltip = game.i18n.localize("CO.roll.critical")
          outcomeSpan.dataset.tooltipDirection = "LEFT"
          outcomeSpan.innerHTML = `<i class="fas fa-check-double"></i>`
        } else if (tr.isFumble) {
          outcomeSpan.className = "target-outcome failure fumble"
          outcomeSpan.dataset.tooltip = game.i18n.localize("CO.roll.fumble")
          outcomeSpan.dataset.tooltipDirection = "LEFT"
          outcomeSpan.innerHTML = `<i class="fas fa-skull-crossbones"></i>`
        } else if (tr.isSuccess) {
          outcomeSpan.className = "target-outcome success"
          outcomeSpan.dataset.tooltip = game.i18n.localize("CO.roll.success")
          outcomeSpan.dataset.tooltipDirection = "LEFT"
          outcomeSpan.innerHTML = `<i class="fas fa-check"></i>`
        } else if (tr.isFailure) {
          outcomeSpan.className = "target-outcome failure"
          outcomeSpan.dataset.tooltip = game.i18n.localize("CO.roll.failure")
          outcomeSpan.dataset.tooltipDirection = "LEFT"
          outcomeSpan.innerHTML = `<i class="fas fa-times"></i>`
        }
        li.appendChild(outcomeSpan)
      }

      // Portrait
      if (tr.img) {
        const img = document.createElement("img")
        img.classList.add("target-portrait")
        img.src = tr.img
        img.dataset.tooltip = tr.name
        img.height = 32
        img.width = 32
        li.appendChild(img)
      }

      // Nom
      const nameSpan = document.createElement("span")
      nameSpan.classList.add("target-name")
      nameSpan.textContent = tr.name
      li.appendChild(nameSpan)

      if (tr.needsSaveRoll) {
        // Bouton de jet de sauvegarde
        const btn = document.createElement("button")
        btn.classList.add("save-roll")
        btn.dataset.saveTarget = tr.uuid
        btn.dataset.saveAbility = message.system.ability
        btn.dataset.saveDifficulty = message.system.difficulty
        const abilityLabel = game.i18n.localize(`CO.abilities.long.${message.system.ability}`)
        btn.dataset.tooltip = `${game.i18n.localize("CO.ui.saves")} : ${abilityLabel}`
        btn.dataset.tooltipDirection = "UP"
        btn.textContent = game.i18n.localize("CO.ui.saves")
        li.appendChild(btn)
      } else {
        // Total du jet
        if (showDifficulty) {
          const totalSpan = document.createElement("span")
          totalSpan.classList.add("target-total")
          const abilityLabel = game.i18n.localize(`CO.abilities.long.${message.system.ability}`)
          const tooltipParts = [`${game.i18n.localize("CO.ui.saves")} : ${abilityLabel}`]
          if (tr.rollFormula) tooltipParts.push(tr.rollFormula)
          totalSpan.dataset.tooltip = tooltipParts.join(" — ")
          totalSpan.dataset.tooltipDirection = "UP"
          totalSpan.innerHTML = `<i class="fas fa-shield-exclamation"></i> ${tr.total}`
          li.appendChild(totalSpan)
        }

        // Bouton point de chance
        if (tr.saveHasLuckyPoints && !tr.isCritical) {
          const lpLink = document.createElement("a")
          lpLink.classList.add("lp-button-save-target")
          lpLink.dataset.targetUuid = tr.uuid
          lpLink.dataset.actorId = tr.saveActorId
          lpLink.innerHTML = `<i class="fa-regular fa-clover" data-tooltip="${game.i18n.localize("CO.dialogs.spendLuckyPoint")}" data-tooltip-direction="UP"></i>`
          li.appendChild(lpLink)
        }
      }

      ul.appendChild(li)
    }

    details.appendChild(ul)
    targetsSection.appendChild(details)
  }

  // ----------------------------------------------------------------
  //  Multi-cible : listeners
  // ----------------------------------------------------------------

  _addMultiTargetListeners(html) {
    // Boutons de jet de sauvegarde par cible
    const saveButtons = html.querySelectorAll(".target-row .save-roll")
    saveButtons.forEach((btn) => {
      const targetUuid = btn.dataset.saveTarget
      const targetActor = fromUuidSync(targetUuid)
      if (!targetActor) return

      const canClick = game.user.isGM || targetActor.isOwner
      if (!canClick) {
        btn.style.visibility = "hidden"
        return
      }

      btn.addEventListener("click", async (event) => {
        event.preventDefault()
        event.stopPropagation()

        const messageId = event.currentTarget.closest(".message").dataset.messageId
        if (!messageId) return
        const message = game.messages.get(messageId)
        if (!message) return

        const saveAbility = btn.dataset.saveAbility
        const difficulty = btn.dataset.saveDifficulty

        const resolved = await SaveRollHandler.resolveSaveRoll({ targetActor, saveAbility, difficulty })
        if (!resolved) return

        const currentTargetResults = message.system.targetResults ?? []
        const newTargetResults = currentTargetResults.map((tr) => {
          if (tr.uuid !== targetUuid) return tr
          return {
            ...tr,
            needsSaveRoll: false,
            total: resolved.rollResult.total,
            isSuccess: resolved.rollResult.isSuccess ?? false,
            isFailure: resolved.rollResult.isFailure ?? false,
            isCritical: resolved.rollResult.isCritical ?? false,
            isFumble: resolved.rollResult.isFumble ?? false,
            saveActorId: resolved.actorId,
            saveHasLuckyPoints: resolved.saveHasLuckyPoints,
            rollFormula: resolved.roll.formula,
            rollTooltip: resolved.roll.options?.toolTip ?? "",
          }
        })

        const rolls = [...this.parent.rolls, resolved.roll]

        await SaveRollHandler.applyEffects({
          customEffect: message.system.customEffect,
          additionalEffect: message.system.additionalEffect,
          result: resolved.rollResult,
          targetActor,
        })

        await SaveRollHandler.updateMessage({ message, updateData: { rolls, "system.targetResults": newTargetResults } })
      })
    })

    // Boutons de points de chance par cible
    const luckyButtons = html.querySelectorAll(".lp-button-save-target")
    luckyButtons.forEach((btn) => {
      const actorId = btn.dataset.actorId
      const saverActor = actorId ? game.actors.get(actorId) : null
      if (!saverActor || (!game.user.isGM && !saverActor.isOwner)) return

      btn.addEventListener("click", async (event) => {
        event.preventDefault()
        event.stopPropagation()

        const messageId = event.currentTarget.closest(".message").dataset.messageId
        if (!messageId) return
        const message = game.messages.get(messageId)
        if (!message) return

        const targetUuid = btn.dataset.targetUuid
        await SaveRollHandler.spendSaverLuckyPoint({ saverActor, message, targetUuid })
      })
    })

    // Interactions hover/click sur les lignes cibles (highlight token)
    const associatedActor = this.parent.getAssociatedActor?.()
    const canInteractWithTargets = game.user.isGM || this.parent.isAuthor || associatedActor?.isOwner
    let highlightedTargetToken = null
    const targetRows = html.querySelectorAll(".target-row[data-target-uuid]")
    targetRows.forEach((targetRow) => {
      if (!canInteractWithTargets) return

      targetRow.classList.add("is-interactive")

      targetRow.addEventListener("click", async (event) => {
        if (event.target.closest("button, a")) return
        event.preventDefault()
        event.stopPropagation()

        const targetReference = Utils.resolveChatTargetReference(targetRow.dataset.targetUuid)
        const targetToken = targetReference?.token
        if (!targetReference?.canLocate || !targetToken || !canvas?.ready) return

        if (targetReference.canControl) {
          targetToken.control({ releaseOthers: !event.shiftKey })
        }
        await canvas.animatePan(targetToken.center)
      })

      targetRow.addEventListener("pointerover", (event) => {
        const targetReference = Utils.resolveChatTargetReference(targetRow.dataset.targetUuid)
        const targetToken = targetReference?.token
        if (!targetReference?.canLocate || !targetToken?.isVisible || targetToken.controlled) return
        targetToken._onHoverIn(event, { hoverOutOthers: true })
        highlightedTargetToken = targetToken
      })

      targetRow.addEventListener("pointerout", (event) => {
        const targetReference = Utils.resolveChatTargetReference(targetRow.dataset.targetUuid)
        const targetToken = targetReference?.token
        if (!targetToken || highlightedTargetToken !== targetToken) return
        targetToken._onHoverOut(event)
        highlightedTargetToken = null
      })
    })
  }

  // ----------------------------------------------------------------
  //  Legacy (single target) : listeners
  // ----------------------------------------------------------------

  _addLegacyListeners(html) {
    const luckyButton = html.querySelector(".lp-button-save")
    const targetUuid = this.targets[0]
    const currentUserActor = game.user.character
    const currentUserActorUuid = currentUserActor ? currentUserActor.uuid : null

    const displayButton = game.user.isGM || currentUserActorUuid === targetUuid

    if (luckyButton && displayButton && !this.result.isCritical) {
      luckyButton.addEventListener("click", async (event) => {
        event.preventDefault()
        event.stopPropagation()
        const messageId = event.currentTarget.closest(".message").dataset.messageId
        if (!messageId) return
        const message = game.messages.get(messageId)

        let rolls = this.parent.rolls
        rolls[0].options.bonus = String(parseInt(rolls[0].options.bonus) + 10)
        rolls[0].options.hasLuckyPoints = false
        rolls[0].options.luckyPointUsed = true
        rolls[0]._total = parseInt(rolls[0].total) + 10

        let newResult = CORoll.analyseRollResult(rolls[0])

        const actorId = rolls[0].options.actorId
        const actor = game.actors.get(actorId)
        if (actor.system.resources.fortune.value > 0) {
          actor.system.resources.fortune.value -= 1
          await actor.update({ "system.resources.fortune.value": actor.system.resources.fortune.value })
        }

        const customEffect = message.system.customEffect
        const additionalEffect = message.system.additionalEffect
        if (customEffect && additionalEffect && additionalEffect.active && Resolver.shouldManageAdditionalEffect(newResult, additionalEffect)) {
          const target = message.system.targets.length > 0 ? message.system.targets[0] : null
          if (target) {
            const targetActor = fromUuidSync(target)
            if (game.user.isGM) await targetActor.applyCustomEffect(customEffect)
            else {
              await game.users.activeGM.query("co2.applyCustomEffect", { ce: customEffect, targets: [targetActor.uuid] })
            }
          }
        }

        if (game.user.isGM) {
          await message.update({ rolls: rolls, "system.result": newResult })
        } else {
          await game.users.activeGM.query("co2.updateMessageAfterLuck", { existingMessageId: message.id, rolls: rolls, result: newResult })
        }
      })
    }

    const saveButton = html.querySelector(".save-roll")
    const displaySaveButton = game.user.isGM || this.isActorTargeted

    if (saveButton && displaySaveButton) {
      saveButton.addEventListener("click", async (event) => {
        event.preventDefault()
        event.stopPropagation()
        const messageId = event.currentTarget.closest(".message").dataset.messageId
        if (!messageId) return
        const message = game.messages.get(messageId)
        if (!message || !message.system) return

        const dataset = event.currentTarget.dataset
        const targetUuid = message.system.targets[0]
        if (!targetUuid) return

        const saveAbility = dataset.saveAbility
        const difficulty = dataset.saveDifficulty

        const targetActor = fromUuidSync(targetUuid)
        if (!targetActor) return

        const targetRollSkill = await targetActor.rollSkill(saveAbility, { difficulty, showResult: false, showOppositeRoll: false })
        if (!targetRollSkill) return

        message.system.result = targetRollSkill.result
        message.system.linkedRoll = targetRollSkill.roll

        let rolls = this.parent.rolls
        rolls[0] = targetRollSkill.roll
        rolls[0].options.oppositeRoll = false

        const customEffect = message.system.customEffect
        const additionalEffect = message.system.additionalEffect
        if (customEffect && additionalEffect && additionalEffect.active && Resolver.shouldManageAdditionalEffect(targetRollSkill.result, additionalEffect)) {
          if (game.user.isGM) await targetActor.applyCustomEffect(customEffect)
          else {
            await game.users.activeGM.query("co2.applyCustomEffect", { ce: customEffect, targets: [targetActor.uuid] })
          }
        }

        if (game.user.isGM) {
          await message.update({ rolls: rolls, "system.showButton": false, "system.result": targetRollSkill.result })
        } else {
          await game.users.activeGM.query("co2.updateMessageAfterSavedRoll", { existingMessageId: message.id, rolls: rolls, result: targetRollSkill.result })
        }
      })
    }
  }
}
