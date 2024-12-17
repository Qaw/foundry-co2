import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoCapacitySheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    return context
  }
}
