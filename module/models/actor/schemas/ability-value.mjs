import {BaseValue} from "./base-value.mjs";

export class AbilityValue extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            superior: new fields.BooleanField({
                required: true,
                initial: false
            }),
            base: new fields.NumberField({
                required: false,
                nullable: false,
                initial: 10,
                min:0,
                integer: true
            }),
            bonuses: new fields.SchemaField({
                sheet: new fields.NumberField({
                    required: true,
                    initial: 0,
                    integer: true
                }),
                effects: new fields.NumberField({
                    required: true,
                    initial: 0,
                    integer: true
                })
            })
        };
    }

    get value() {
        return this.base + this.bonuses.sheet + this.bonuses.effects ;
    }
    get mod() {
        return AbilityValue.getModFromValue(this.value);
    }
    static getModFromValue = function (value) {
        return value < 4 ? -4 : Math.floor(value / 2) - 5;
    };
    static getValueFromMod = function (mod) {
        return mod * 2 + 10;
    };
}