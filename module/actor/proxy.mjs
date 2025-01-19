import CoActor from "./actor.mjs"
import CoCharacter from "./character.mjs"
import CoEncounter from "./encounter.mjs"

const handler = {
  construct(_, args) {
    switch (args[0]?.type) {
      case "character":
        return new CoCharacter(...args)
      case "encounter":
        return new CoEncounter(...args)
    }
  },
}

export const CoActorProxy = new Proxy(CoActor, handler)
