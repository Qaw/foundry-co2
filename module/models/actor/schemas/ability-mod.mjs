import {BaseValue} from "./base-value.mjs";

export class AbilityModifier extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            superior: new fields.BooleanField({
                required: true,
                initial: false
            }),
            mod: new fields.EmbeddedDataField(BaseValue)
        };
    }

    get value() {
        return AbilityModifier.getValueFromMod(this.mod);
    }
    static getValueFromMod = function (mod) {
        return mod * 2 + 10;
    };
}