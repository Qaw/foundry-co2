import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoFeatureSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    let infosCapacities = []
    for (const capacity of this.item.system.capacities) {
      let item = await fromUuid(capacity)
      // Item could be null if the item has been deleted in the compendium
      if (item) {
        infosCapacities.push(item.infos)
      }
    }
    context.capacities = infosCapacities

    let infosPaths = []
    for (const path of this.item.system.paths) {
      let item = await fromUuid(path)
      // Item is null if the item has been deleted in the compendium
      if (item) {
        infosPaths.push(item.infos)
      }
    }
    context.paths = infosPaths

    context.choiceFeatureSubtypes = SYSTEM.FEATURE_SUBTYPE

    return context
  }
}
