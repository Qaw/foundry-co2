import { LOG_HEAD } from './common/constants.js';
import { CO } from './common/config.js';
import  CoActor from './actor/actor.js';
import CoCharacterSheet from './actor/sheet/character-sheet.js';
import { preloadHandlebarsTemplates } from './common/templates.js';
import { SpecieModel } from './common/models.js';
import { CoItem } from './item/item.js';

Hooks.once("init", async function() {

    console.log(LOG_HEAD + "Initializing Chroniques Oubliées System");
    

    // Configuration
    CONFIG.CO = CO;
    CONFIG.Actor.documentClass = CoActor;
    CONFIG.Item.documentClass = CoItem;

    CONFIG.Item.systemDataModels["specie"] = SpecieModel;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("co", CoCharacterSheet, {
        types: ["character"],
        makeDefault: true,
        label: "CO.label.sheet-character"
      });

    // Preload Handlebars Templates
	  preloadHandlebarsTemplates();

});