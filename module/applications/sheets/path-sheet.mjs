import { SYSTEM } from "../../config/system.mjs"
import PathData from "../../models/path.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoPathSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    context.capacities = await this.item.system.getCapacities()

    // Select options
    context.choicePathSubtypes = SYSTEM.PATH_TYPES

    return context
  }
}
