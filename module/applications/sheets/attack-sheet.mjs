import { SYSTEM } from "../../config/system.mjs"
import CoBaseItemSheet from "./base-item-sheet.mjs"

export default class CoAttackSheet extends CoBaseItemSheet {
  /** @override */
  async getData(options = {}) {
    const context = await super.getData(options)

    context.choiceAttackType = SYSTEM.ATTACK_TYPE

    return context
  }
}
