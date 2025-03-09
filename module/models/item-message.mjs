import BaseMessageData from "./base-message.mjs"

export default class ItemMessageData extends BaseMessageData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      customItem: new fields.StringField({ required: true, nullable: false, initial: "" }),
    })
  }
}
