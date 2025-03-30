import { CustomEffectData } from "./models/schemas/custom-effect.mjs"
import { Modifier } from "./models/schemas/modifier.mjs"

/**
 * Prise en charge des evènements transmis par le socket selon le type d'action transmis.
 *
 * @param {Object} [params={}] Les paramètres fournis par l'évènement du socket.
 * @param {string|null} [params.action=null] L'action à réaliser.
 * @param {Object} [params.data={}] Les données passés en paramètres.
 * @returns {*} Le résultat du gestionnaire de l'évènement le cas échéant.
 */
export function handleSocketEvent({ action = null, data = {} } = {}) {
  console.debug("handleSocketEvent", action, data)
  switch (action) {
    case "heal":
      return _heal(data)
    case "customEffect":
      return CustomEffectData.handle(data)
    case "oppositeRoll":
      return _oppositeRoll(data)
  }
}

/** * @description
 * //Fonction qui va proposer dans le chat d'appliquer des soins
 * @param {*} targets : Liste d'uuid d'acteur cible
 * @param {int} Quantité de PV restaurés
 * @param {string} id de l'acteur à l'origine du soin
 */
export async function _heal({ targets, healAmount, fromUserId }) {
  if (game.user.isGM) {
    for (const target of targets) {
      const actor = fromUuidSync(target)
      await actor.applyHeal(healAmount)
    }
  }
}

/**
 *
 * @param root0
 * @param root0.userId
 * @param root0.messageId
 * @param root0.rolls
 * @param root0.result
 */
export async function _oppositeRoll({ userId, messageId, rolls, result } = {}) {
  console.log(`handleSocketEvent _oppositeRoll from ${userId} !`, messageId, rolls, result)
  // const currentUser = game.user._id
  if (game.user.isGM) {
    const message = game.messages.get(messageId)
    await message.update({ rolls: rolls, "system.result": result })
  }
}
