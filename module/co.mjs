import {CO} from './system/config.mjs';
import CoActor from './actor/actor.mjs';
import CoCharacterSheet from './actor/sheet/character-sheet.mjs';
import CoItemSheet from './item/sheet/item-sheet.mjs';
import { preloadHandlebarsTemplates } from './ui/templates.mjs';
import { CoItem } from './item/item.mjs';
import { registerHandlebarsHelpers } from './ui/helpers.mjs';
import {Log} from "./utils/log.mjs";
import { Modifier } from './system/modifiers.mjs';
import { registerSystemSettings } from './system/settings.js';

Hooks.once("init", async function () {

    Log.debug("Initializing...");

    // Configuration
    CONFIG.Actor.documentClass = CoActor;
    CONFIG.Item.documentClass = CoItem;
    //CONFIG.Item.compendiumIndexFields.push('system.description.value');

    game.co = {
        Modifier: Modifier,
        config: CO
    }

    // Unregister legacy sheets
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register application sheets
    Actors.registerSheet("co", CoCharacterSheet, {
        types: ["character", "encounter", "vendor", "vehicle", "marker"], makeDefault: true, label: "CO.sheet.character"
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

});

Hooks.once("ready", async function () {
    await game.packs.get("world.capacites").getIndex({"fields": [ "system.description.value" ]});
    Log.info(game.i18n.localize("CO.notif.ready"));
});