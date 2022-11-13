/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
import {SYSTEM_NAME} from "../system/constants.mjs";

export const preloadHandlebarsTemplates = async function() {
	
    // Define template paths to load
	const templatePaths = [
		// ACTOR		
		'systems/' + SYSTEM_NAME + '/templates/actors/character-sheet.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-stats.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-actions.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-inventory.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-capacities.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-effects.hbs',
		'systems/' + SYSTEM_NAME + '/templates/actors/parts/character-bio.hbs',

		// EFFECTS
		'systems/' + SYSTEM_NAME + '/templates/effects/effects.hbs',
		'systems/' + SYSTEM_NAME + '/templates/effects/effects-item.hbs',

		// ITEM
		'systems/' + SYSTEM_NAME + '/templates/items/item-sheet.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/equipment-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/feature-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/profile-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/consumable-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/loot-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/currency-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/action-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/path-partial.hbs',
		'systems/' + SYSTEM_NAME + '/templates/items/parts/capacity-partial.hbs'
	];

	// Load the template parts
	return loadTemplates(templatePaths);
}; 