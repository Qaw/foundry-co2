import { SYSTEM } from "../../config/system.mjs"
import Utils from "../../utils.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoCapacitySheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)
    context.choiceCapacityActionTypes = SYSTEM.CAPACITY_ACTION_TYPE
    context.choiceCapacityFrequency = SYSTEM.CAPACITY_FREQUENCY

    if (CONFIG.debug.co?.sheets) console.debug(Utils.log(`CoCapacitySheet - context`), context)
    return context
  }
}
