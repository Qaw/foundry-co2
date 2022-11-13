import {CO} from './system/config.mjs';
import CoActor from './actor/actor.mjs';
import CoCharacterSheet from './actor/sheet/character-sheet.mjs';
import CoItemSheet from './item/sheet/item-sheet.mjs';
import { preloadHandlebarsTemplates } from './ui/templates.mjs';
import { SpecieModel, ProfileModel, PathModel, CapacityModel } from './system/models.mjs';
import { CoItem } from './item/item.mjs';
import { registerHandlebarsHelpers } from './ui/helpers.mjs';
import {Log} from "./utils/log.mjs";

Hooks.once("init", async function () {

    Log.debug("Initializing...");

    // Configuration
    CONFIG.CO = CO;
    CONFIG.Actor.documentClass = CoActor;
    CONFIG.Item.documentClass = CoItem;

    // CONFIG.Item.systemDataModels["specie"] = SpecieModel;
    // CONFIG.Item.systemDataModels["profile"] = ProfileModel;
    // CONFIG.Item.systemDataModels["path"] = PathModel;
    // CONFIG.Item.systemDataModels["capacity"] = CapacityModel;

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
});

Hooks.once("ready", async function () {
    Log.info(game.i18n.localize("CO.notif.ready"));
});