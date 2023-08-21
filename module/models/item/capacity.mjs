import { CommonData } from "./schemas/common.mjs";

export class CapacityData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            common : new fields.EmbeddedDataField(CommonData),
            subtype : new fields.StringField({
                required: true,
                nullable: false,
                initial: ""
            }),
            learned: new fields.BooleanField({
                required: true,
                initial: false
            }),
            charges: new fields.SchemaField({
                current: new fields.NumberField({
                    required: false,
                    nullable: true,
                    integer: true
                }),
                max: new fields.NumberField({
                    required: false,
                    nullable: true,
                    integer: true
                })
            }),
            properties: new fields.SchemaField({
                spell: new fields.BooleanField({
                    required: true,
                    initial: false
                }),
                chargeable: new fields.BooleanField({
                    required: true,
                    initial: false
                })
            }),
            path: new fields.StringField({
                required: true,
                nullable: true,
                initial: null
            }),
            actions: new fields.ArrayField(new fields.ObjectField())
        }
    }
}