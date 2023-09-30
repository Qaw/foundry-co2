export class AbilityModifier extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            superior: new fields.BooleanField({
                required: true,
                initial: false
            }),
            mod: new fields.NumberField({
                required: true,
                nullable: false,
                initial: 0,
                integer: true,
                positive:false
            })
        };
    }
}