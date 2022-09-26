import { MODIFIER_TYPE, MODIFIER_TARGET } from "./constants.js";

export class CharacteristicModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({required: true, blank: false, initial: "key"})
        }
    }
}

export class ModifierModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({blank: false, choices: Object.values(MODIFIER_TYPE), validationError: "must be a value in CONST.MODIFIER_TYPE."}),
            target: new fields.StringField({blank: false, choices: Object.values(MODIFIER_TARGET), validationError: "must be a value in CONST.MODIFIER_TARGET"}),
            bonus: new fields.NumberField(),
            description: new fields.StringField({blank: true}),
            active: new fields.BooleanField({initial: false})
        }
    }
}

export class SpecieModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({required: true, blank: false, initial: "key"}),
            description: new fields.StringField({blank: true}),
            moduleData: new fields.ObjectField(),
            modifiers: new fields.ArrayField(new fields.EmbeddedDataField(ModifierModel)),
            paths: new fields.ArrayField(new fields.ObjectField()),
            capacities: new fields.ArrayField(new fields.ObjectField())
        }
    }
}