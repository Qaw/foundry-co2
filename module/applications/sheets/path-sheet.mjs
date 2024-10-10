import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoPathSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    let infosCapacities = []
    for (const capacity of this.item.system.capacities) {
      let item = null
      // Embedded item on actor
      if (this.item.isEmbedded) {
        const actor = this.item.parent
        item = actor.items.get(capacity)
      }
      // World or compendium item
      else {
        item = await fromUuid(capacity)
      }
      // Item could be null if the item has been deleted in the compendium
      if (item != null) {
        infosCapacities.push(item.infos)
      }
    }
    context.capacities = infosCapacities

    context.choicePathSubtypes = SYSTEM.PATH_TYPES

    return context
  }
}
