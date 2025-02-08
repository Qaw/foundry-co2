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
    case "buff":
      return _buff(data)
    case "heal":
      return _heal(data.toUserId, data.healAmount, data.fromUserId, data.resolver)
  }
}

/**
 * Handles the socket event to ask for a roll.
 *
 * @param {Object} [options={}] The options object.
 * @param {string} [options.userId] The ID of the user who initiated the roll.
 */
export function _buff({ userId } = {}) {
  console.debug(`handleSocketEvent _buff from ${userId} !`)
  const currentUser = game.user._id
  if (userId === currentUser) {
    // Ajouter un message chat pour dire : vous avez reçu une amélioration de XXX et gérer l'ajout de l'amélioration temporaire
  }
}

/** * @description
 * //Fonction qui va proposer dans le chat d'appliquer des soins
 * @param {*} toACtorId : Liste d'id d'acteur cible
 * @param {int} Quantité de PV restaurés
 * @param {string} id de l'acteur à l'origine du soin
 * @param {Resolver} resolver Instance de la classe resolver définissant le soin
 */
export async function _heal({ toACtorId, healAmount, fromUserId, resolver }) {
  console.debug(`handleSocketEvent _heal from ${fromUserId} to ${toUserId} amount ${healAmount} !`)

  const actor = game.actors.get(target)
  if (actor) {
    if (actor.testUserPermission(game.user, "OWNER", { exact: true })) {
      //je suis bien sur l'utilisateur possédant l'acteur ciblé, j'applique les soins à mon personnage
      actor.system.attributes.hp.value += healAmount
      if (actor.system.attributes.hp.value > actor.system.attributes.hp.max) actor.system.attributes.hp.value = actor.system.attributes.hp.max
      actor.update({ "system.attributes.hp.value": actor.system.attributes.hp.value })
      //envoyer un petit message chat pour dire qu'il a été soigné par l'auteur
      let content = "vous avez été soigné par "
      const autor = game.actors.get(fromUserId)
      if (autor) {
        content += " " + autor.name
      }
      await ChatMessage.implementation.create({
        content,
        speaker: ChatMessage.implementation.getSpeaker({ actor }),
        whisper: game.user,
      })
    }
  }
}
