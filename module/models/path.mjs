import ItemData from "./item.mjs"
import { SYSTEM } from "../config/system.mjs"

/**
 * Define the data schema for a Path
 * subtype : the type of the path
 * capacities : an array of capacities' uuis
 * rank : the rank in the path, will be define when a capacity is learned and unlearned
 */
export default class PathData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({ required: true, choices: SYSTEM.PATH_TYPES, initial: "profile" }),
      capacities: new fields.ArrayField(new fields.DocumentUUIDField({ type: "Item" })),
      rank: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
    })
  }
}
