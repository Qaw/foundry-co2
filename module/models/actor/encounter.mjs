import {AbilityModifier} from "./schemas/ability-mod.mjs";
import {BaseValue} from "./schemas/base-value.mjs";
import {AttackData} from "./schemas/attack.mjs";

export class EncounterData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            abilities: new fields.SchemaField({
                str: new fields.EmbeddedDataField(AbilityModifier),
                dex: new fields.EmbeddedDataField(AbilityModifier),
                con: new fields.EmbeddedDataField(AbilityModifier),
                int: new fields.EmbeddedDataField(AbilityModifier),
                wis: new fields.EmbeddedDataField(AbilityModifier),
                cha: new fields.EmbeddedDataField(AbilityModifier)
            }),
            combat: new fields.SchemaField({
                init: new fields.EmbeddedDataField(BaseValue),
                def: new fields.EmbeddedDataField(BaseValue),
                attacks : new fields.ArrayField(new fields.EmbeddedDataField(AttackData))
            }),
            attributes: new fields.SchemaField({
                hp: new fields.EmbeddedDataField(BaseValue),
                movement: new fields.EmbeddedDataField(BaseValue),
                level: new fields.EmbeddedDataField(BaseValue)
            }),
            pasteData : new fields.HTMLField(),
            details: new fields.SchemaField({
                archetype : new fields.StringField({
                    required: false,
                    nullable: true,
                    initial: game.co.config.encounter.archetypes.standard,
                    options: game.co.config.encounter.archetypes
                }),
                category : new fields.StringField({
                    required: false,
                    nullable: true,
                    initial: game.co.config.encounter.categories.humanoid,
                    options: game.co.config.encounter.categories
                }),
                size: new fields.StringField({
                    required: false,
                    nullable: true,
                    initial: game.co.config.encounter.sizes.medium,
                    options: game.co.config.encounter.sizes
                }),
                bossRank : new fields.NumberField({
                    required: false,
                    nullable: true,
                    initial: 0,
                    min:0,
                    max:5,
                    integer: true
                }),
                description: new fields.SchemaField({
                    private: new fields.HTMLField(),
                    public: new fields.HTMLField()
                }),
                notes: new fields.SchemaField({
                    private: new fields.HTMLField(),
                    public: new fields.HTMLField()
                }),
                languages: new fields.ArrayField(new fields.StringField())
            })
        };
    }
}
