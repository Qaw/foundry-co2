export const registerSystemSettings = function () {
  /**
   * Valeur de Base pour le Calcul de la DEF
   */
  game.settings.register("co", "baseDef", {
    name: "SETTINGS.BaseDef",
    hint: "SETTINGS.BaseDefHint",
    scope: "world",
    config: true,
    type: Number,
    default: 10,
    requiresReload: true,
  })

  /**
   * Mode DEBUG
   */
  game.settings.register("co", "debugMode", {
    name: "SETTINGS.DebugMode",
    hint: "SETTINGS.DebugModeHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register("co", "useVarInit", {
    name: "SETTINGS.VarInit.name",
    hint: "SETTINGS.VarInit.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register("co", "displayDifficulty", {
    name: "SETTINGS.DisplayDifficulty.name",
    hint: "SETTINGS.DisplayDifficulty.hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.DisplayDifficulty.none",
      all: "SETTINGS.DisplayDifficulty.all",
      gm: "SETTINGS.DisplayDifficulty.gm",
    },
  })

  game.settings.register("co", "useComboRolls", {
    name: "SETTINGS.UseComboRolls.name",
    hint: "SETTINGS.UseComboRolls.hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register("co", "displayChatDamageButtonsToAll", {
    name: "SETTINGS.DisplayChatDamageButtonsToAll.name",
    hint: "SETTINGS.DisplayChatDamageButtonsToAll.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("co", "useRecovery", {
    name: "SETTINGS.UseRecovery.name",
    hint: "SETTINGS.UseRecovery.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  })

  game.settings.register("co", "useFortune", {
    name: "SETTINGS.UseFortune.name",
    hint: "SETTINGS.UseFortune.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  })

  game.settings.register("co", "useMana", {
    name: "SETTINGS.UseMana.name",
    hint: "SETTINGS.UseMana.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  })

  game.settings.register("co", "checkFreeHandsBeforeEquip", {
    name: "SETTINGS.CheckFreeHandsBeforeEquip.name",
    hint: "SETTINGS.CheckFreeHandsBeforeEquip.hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.CheckFreeHandsBeforeEquip.none",
      all: "SETTINGS.CheckFreeHandsBeforeEquip.all",
      gm: "SETTINGS.CheckFreeHandsBeforeEquip.gm",
    },
  })
}
