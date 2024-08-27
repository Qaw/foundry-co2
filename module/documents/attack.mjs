import CoItem from "./item.mjs"
import { Action } from "../models/action/action.mjs"

export default class CoAttack extends CoItem {
  get displayValues() {
    let attack = ""
    let damage = ""
    let source = ""
    let actions = this.actions
    if (actions.length > 0) {
      let action = Action.createFromExisting(actions[0])
      if (action.hasResolvers) {
        let resolver = action.resolvers[0]
        attack = resolver?.skill?.formula[0].part
        damage = resolver?.dmg?.formula[0].part
      }
      source = action.source
    }
    return { attack, damage, source }
  }
}
