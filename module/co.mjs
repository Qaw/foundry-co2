import {CO} from './system/config.mjs';
import CoCharacterSheet from './actor/sheet/character-sheet.mjs';
import CoItemSheet from './item/sheet/item-sheet.mjs';
import {preloadHandlebarsTemplates} from './ui/templates.mjs';
import {CoItem} from './item/item.mjs';
import {registerHandlebarsHelpers} from './ui/helpers.mjs';
import {Modifier} from './models/modifiers.mjs';
import {registerSystemSettings} from './system/settings.js';
import CoEncounterSheet from "./actor/sheet/encounter-sheet.mjs";

import {CharacterData} from './models/actor/character.mjs';
import {CoActorProxy} from './actor/proxy.mjs';
import registerHooks from './system/hooks.mjs';
import {EncounterData} from "./models/actor/encounter.mjs";

Hooks.once("init", async function () {

    game.co = {
        log : function(message) {
            return ('Chroniques Oubliées | ' + message);
        },
        Modifier: Modifier,
        config: CO
    }

    console.debug(game.co.log("Initializing..."));

    // Hook up system data types
    CONFIG.Actor.dataModels = {
        character: CharacterData,
        encounter: EncounterData
    };
    // CONFIG.Item.dataModels = {
    //     capacity : CapacityData,
    //     equipment : EquipmentData,
    //     feature : FeatureData,
    //     profile : ProfileData,
    //     path : PathData
    // };

    CONFIG.Actor.documentClass = CoActorProxy;
    CONFIG.Item.documentClass = CoItem;


    // Unregister legacy sheets
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register application sheets
    Actors.registerSheet("co", CoCharacterSheet, {
        types: ["character", "vendor", "vehicle", "marker"], makeDefault: true, label: "CO.sheet.character"
    });
    Actors.registerSheet("co", CoEncounterSheet, {
        types: ["encounter"], makeDefault: true, label: "CO.sheet.encounter"
    });

    Items.registerSheet("co", CoItemSheet, {
        types: ["equipment", "trait", "profile", "feature", "consumable", "loot", "currency", "container", "action", "path", "capacity"], makeDefault: true, label: "CO.sheet.item"
    });

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Register System Settings
	registerSystemSettings();

    // Register hooks
    registerHooks();

    // Load Martial Training
    if (!game.co.config.martialTrainingsWeapons) {
        game.co.config.martialTrainingsWeapons = [];
    }
    if (!game.co.config.martialTrainingsArmors) {
        game.co.config.martialTrainingsArmors = [];
    }
    if (!game.co.config.martialTrainingsShields) {
        game.co.config.martialTrainingsShields = [];
    }

    // Initiative
    if (game.settings.get("co", "useVarInit")) {
        CONFIG.Combat.initiative = {
          formula: "1d6x + @combat.init.value + @abilities.wis.value/100",
          decimals: 2
        };
    } else {
        CONFIG.Combat.initiative = {
          formula: "@combat.init.value + @abilities.wis.value/100",
          decimals: 2
        };
    }

});

Hooks.once("ready", async function () {   
    console.info(game.co.log(game.i18n.localize("CO.notif.ready")));
});