export class ResourceValue extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            base: new fields.NumberField({
                required: true,
                nullable: false,
                initial: 0,
                integer: true
            }),
            value: new fields.NumberField({
                required: true,
                nullable: false,
                initial: 0,
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
    get max() {
        return this.base + this.bonuses.sheet + this.bonuses.effects;
    }
}