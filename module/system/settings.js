export const registerSystemSettings = function() {
	/**
     * Display FRench Compendium
     */
	 game.settings.register('co', 'baseDef', {
		name: 'SETTINGS.BaseDef',
		hint: 'SETTINGS.BaseDefHint',
		scope: 'world',
		config: true,
		type: Number,
		default: 10,
		requiresReload: true
	});

}