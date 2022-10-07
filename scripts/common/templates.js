/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
	
    // Define template paths to load
	const templatePaths = [
		// ACTOR		
		'systems/co/templates/actors/character-sheet.hbs',
        'systems/co/templates/actors/parts/character-characteristics.hbs',
		'systems/co/templates/actors/parts/character-details.hbs',
		'systems/co/templates/actors/parts/character-tabs.hbs',
		'systems/co/templates/actors/parts/character-paths.hbs',
		'systems/co/templates/actors/parts/character-capacities.hbs',
 
		// ITEM
		'systems/co/templates/items/item-sheet.hbs',
		'systems/co/templates/items/parts/details/path-details.hbs',
		'systems/co/templates/items/parts/details/capacity-details.hbs'
	];

	// Load the template parts
	return loadTemplates(templatePaths);
}; 