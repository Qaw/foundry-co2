import { MODIFIER_TYPE, MODIFIER_TARGET, MAGIC_ATTACK_TYPE, PATH_TYPE } from "./constants.js";
export class SpecieModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({blank: false, nullable: true, initial: null}),
            description: new fields.StringField(),
            moduleData: new fields.ObjectField(),
            modifiers: new fields.ArrayField(new fields.EmbeddedDataField(ModifierModel)),
            paths: new fields.ArrayField(new fields.ObjectField()),
            capacities: new fields.ArrayField(new fields.ObjectField())
        }
    }
}

export class ProfileModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({blank: false, nullable: true, initial: null}),
            description: new fields.StringField(),
            moduleData: new fields.ObjectField(),
            hd: new fields.NumberField(),
            magicAttack: new fields.StringField({blank: true, choices: Object.values(MAGIC_ATTACK_TYPE), validationError: "must be a value in CONST.MAGIC_ATTACK_TYPE"}),
            mpMultiplier: new fields.NumberField(),
            proficiencies: new fields.ObjectField(),
            paths: new fields.ArrayField(new fields.ObjectField())
        }
    }
}

export class PathModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({blank: false, nullable: true, initial: null}),
            description: new fields.StringField(),
            moduleData: new fields.ObjectField(),
            maxRank: new fields.NumberField({min: 0, max: 5, integer: true, positive: true}),
            rank: new fields.NumberField({min: 0, max: 5, integer: true, positive: true}),
            type: new fields.StringField({blank: true, choices: Object.values(PATH_TYPE), validationError: "must be a value in CONST.PATH_TYPE"}),
            capacities: new fields.ArrayField(new fields.ObjectField())
        }
    }
}

export class CapacityModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({blank: false, nullable: true, initial: null}),
            description: new fields.StringField(),
            moduleData: new fields.ObjectField(),
            learned: new fields.BooleanField({initial: false}),
            features: new fields.ArrayField(new fields.EmbeddedDataField(FeatureModel))
        }
    }
}

export class ModifierModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({blank: false, choices: Object.values(MODIFIER_TYPE), validationError: "must be a value in CONST.MODIFIER_TYPE"}),
            target: new fields.StringField({blank: false, choices: Object.values(MODIFIER_TARGET), validationError: "must be a value in CONST.MODIFIER_TARGET"}),
            bonus: new fields.NumberField(),
            description: new fields.StringField(),
            active: new fields.BooleanField({initial: false})
        }
    }
}

export class FeatureModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            key: new fields.StringField({blank: false, nullable: true, initial: null}),
            description: new fields.StringField(),
            moduleData: new fields.ObjectField(),
            type: new fields.StringField(),
            subType: new fields.StringField(),
            target: new fields.StringField(),
            formula: new fields.StringField(),
            additionalInfo: new fields.StringField()
        }
    }

}