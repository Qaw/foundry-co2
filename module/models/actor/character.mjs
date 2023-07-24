import {AbilityValue} from "./schemas/ability-value.mjs";
import {BaseValue} from "./schemas/base-value.mjs";

export class CharacterData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            abilities : new fields.SchemaField({
                str: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.str", nullable:false}),
                dex: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.dex", nullable:false}),
                con: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.con", nullable:false}),
                int: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.int", nullable:false}),
                wis: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.wis", nullable:false}),
                cha: new fields.EmbeddedDataField(AbilityValue, {label : "CO.abilities.long.cha", nullable:false})
            }),
            combat : new fields.SchemaField({
                init: new fields.EmbeddedDataField(BaseValue, {nullable: false, label: "CO.combat.long.init"}),
                def: new fields.EmbeddedDataField(BaseValue, {nullable: false,
                    initial: {
                        base: 10,
                        ability: "dex",
                        label: "CO.combat.long.def",
                        bonuses: {
                            sheet: 0,
                            effects: 0
                        }
                    }
                }),
                melee: new fields.EmbeddedDataField(BaseValue, {nullable: false,
                    initial: {
                        base: 0,
                        ability: "str",
                        label: "CO.combat.long.melee",
                        bonuses: {
                            sheet: 0,
                            effects: 0
                        }
                    }
                }),
                ranged: new fields.EmbeddedDataField(BaseValue, {nullable: false,
                    initial: {
                        base: 0,
                        ability: "dex",
                        label: "CO.combat.long.ranged",
                        bonuses: {
                            sheet: 0,
                            effects: 0
                        }
                    }
                }),
                magic: new fields.EmbeddedDataField(BaseValue, {nullable: false,
                    initial: {
                        base: 0,
                        ability: "int",
                        label: "CO.combat.long.magic",
                        bonuses: {
                            sheet: 0,
                            effects: 0
                        }
                    }
                })
            }),
            attributes : new fields.SchemaField({
                movement: new fields.EmbeddedDataField(BaseValue, {
                    label : "CO.label.long.movement",
                    nullable:false,
                    initial : { base : 20, unit : "m", bonuses : { sheet :0, effects : 0 } }
                }),
                level: new fields.EmbeddedDataField(BaseValue, {
                    label : "CO.label.long.level",
                    nullable:false
                }),
                encumbrance: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                    encumbered: new fields.BooleanField({
                        required: true,
                        initial: false
                    }),
                }),
                hp: new fields.SchemaField({
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
                    temp: new fields.NumberField({
                        required: true,
                        nullable: true,
                        initial: null,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                    tempmax: new fields.NumberField({
                        required: true,
                        nullable: true,
                        initial: null,
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
                }, {label : "CO.label.long.hp", nullable:false}),
                xp: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.label.long.xp", required: true, nullable:false})
            }),
            resources : new fields.SchemaField({
                recovery: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.recovery", nullable:false}),
                fortune: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.fortune", nullable:false}),
                mana: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.mana", nullable:false}),
                primary: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.primary", nullable:false}),
                secondary: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.secondary", nullable:false}),
                tertiary: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                }, {label : "CO.resources.long.tertiary", nullable:false}),
            }),
            details : new fields.SchemaField({
                biography: new fields.SchemaField({
                    private: new fields.HTMLField(),
                    public: new fields.HTMLField()
                }),
                appearance: new fields.SchemaField({
                    private: new fields.HTMLField(),
                    public: new fields.HTMLField()
                }),
                notes: new fields.SchemaField({
                    private: new fields.HTMLField(),
                    public: new fields.HTMLField()
                }),
                size: new fields.StringField({
                    required: false,
                    nullable: true,
                    initial: "medium"
                }),
                languages: new fields.ArrayField(new fields.StringField())
            })
        };
    }
}