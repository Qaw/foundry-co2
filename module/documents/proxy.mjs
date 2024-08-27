import CoItem from "./item.mjs"
import CoAttack from "./attack.mjs"

const handler = {
  construct(_, args) {
    switch (args[0]?.type) {
      case "attack":
        return new CoAttack(...args)
      default:
        return new CoItem(...args)
    }
  },
}

export const CoItemrProxy = new Proxy(CoItem, handler)
