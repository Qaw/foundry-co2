export const registerSystemSettings = function() {
	/**
     * Valeur de Base pour le Calcul de la DEF
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

	/**
	 * Mode DEBUG
	 */
	game.settings.register('co', 'debugMode', {
		name: 'SETTINGS.DebugMode',
		hint: 'SETTINGS.DebugModeHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: true
	});

	game.settings.register("co", "useVarInit", {
        name: "SETTINGS.VarInit.name",
        hint: "SETTINGS.VarInit.hint",
        scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		requiresReload: true
    });
}