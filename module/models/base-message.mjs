import { SYSTEM } from "../config/system.mjs"

export default class BaseMessageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      targets: new fields.ArrayField(new fields.DocumentUUIDField({ type: "Actor" })),
    }
  }
}
