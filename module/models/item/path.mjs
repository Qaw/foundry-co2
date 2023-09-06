import { CommonData } from "./schemas/common.mjs";

export class PathData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            common : new fields.EmbeddedDataField(CommonData),
            subtype : new fields.StringField({
                required: true,
                nullable: false,
                initial: ""
            }),
            capacities : new fields.ArrayField(new fields.StringField()),
            rank : new fields.NumberField({
                required: true,
                nullable: false,
                initial: 0,
                integer: true
            })
        }
    }
}