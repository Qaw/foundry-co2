import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoFeatureSheet extends CoBaseItemSheet {
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

    let infosPaths = []
    for (const path of this.item.system.paths) {
      let item = null
      // Embedded item on actor
      if (this.item.isEmbedded) {
        const actor = this.item.parent
        item = actor.items.get(path)
      }
      // World or compendium item
      else {
        item = await fromUuid(path)
      }
      // Item is null if the item has been deleted in the compendium
      if (item != null) {
        infosPaths.push(item.infos)
      }
    }
    context.paths = infosPaths

    context.choiceFeatureSubtypes = SYSTEM.FEATURE_SUBTYPE

    return context
  }
}
