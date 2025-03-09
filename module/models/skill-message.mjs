import { SYSTEM } from "../config/system.mjs"
import BaseMessageData from "./base-message.mjs"

export default class SkillMessageData extends BaseMessageData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      customSkill: new fields.StringField({ required: true, nullable: false, initial: "" }),
    })
  }
}
