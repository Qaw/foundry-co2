import { LOG_HEAD } from './common/constants.js';
import { CO } from './common/config.js';
import CoActor from './actor/actor.js';
import CoCharacterSheet from './actor/sheet/character-sheet.js';
import CoItemSheet from './item/sheet/item-sheet.js';
import { preloadHandlebarsTemplates } from './common/templates.js';
import { SpecieModel, ProfileModel, PathModel, CapacityModel } from './common/models.js';
import { CoItem } from './item/item.js';
import { registerHandlebarsHelpers } from './common/helpers.js';

Hooks.once("init", async function() {

    console.log(LOG_HEAD + "Initializing Chroniques Oubliées System");
    

    // Configuration
    CONFIG.CO = CO;
    CONFIG.Actor.documentClass = CoActor;
    CONFIG.Item.documentClass = CoItem;

    CONFIG.Item.systemDataModels["specie"] = SpecieModel;
    CONFIG.Item.systemDataModels["profile"] = ProfileModel;
    CONFIG.Item.systemDataModels["path"] = PathModel;
    CONFIG.Item.systemDataModels["capacity"] = CapacityModel;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("co", CoCharacterSheet, {
        types: ["character"],
        makeDefault: true,
        label: "CO.label.sheet-character"
      });

      Items.unregisterSheet("core", ItemSheet);
      Items.registerSheet("co", CoItemSheet, {
        types: ["specie","profile","path","capacity"],
        makeDefault: true,
        label: "CO.label.sheet-item"
      });


    // Preload Handlebars Templates
	  preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();
});