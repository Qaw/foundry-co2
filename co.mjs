// Configuration
import { SYSTEM } from "./module/config/system.mjs"
globalThis.SYSTEM = SYSTEM

import CoCharacterSheet from "./module/applications/sheets/character-sheet.mjs"
import CoEncounterSheet from "./module/applications/sheets/encounter-sheet.mjs"

import { CoActorProxy } from "./module/actor/proxy.mjs"
import CoItem from "./module/documents/item.mjs"

// Import modules
import * as models from "./module/models/_module.mjs"
import * as applications from "./module/applications/_module.mjs"

// Helpers
import preloadHandlebarsTemplates from "./module/templates.mjs"
import registerHandlebarsHelpers from "./module/helpers.mjs"
import registerSystemSettings from "./module/settings.mjs"
import registerHooks from "./module/hooks.mjs"
import { Macros } from "./module/system/macros.mjs"
import Utils from "./module/utils.mjs"

Hooks.once("init", async function () {
  console.info(SYSTEM.ASCII)
  console.info(Utils.log("Initializing..."))

  globalThis.cof = game.system
  game.system.CONST = SYSTEM

  // Expose the system API
  game.system.api = {
    applications,
    models,
    macros: Macros,
  }

  // Hook up system data types
  CONFIG.Actor.dataModels = {
    character: models.CharacterData,
    encounter: models.EncounterData,
  }

  CONFIG.Item.dataModels = {
    capacity: models.CapacityData,
    equipment: models.EquipmentData,
    feature: models.FeatureData,
    profile: models.ProfileData,
    path: models.PathData,
    attack: models.AttackData,
  }

  CONFIG.Actor.documentClass = CoActorProxy
  CONFIG.Item.documentClass = CoItem

  // Unregister legacy sheets
  Actors.unregisterSheet("core", ActorSheet)
  Items.unregisterSheet("core", ItemSheet)

  // Register application sheets
  Actors.registerSheet(SYSTEM.ID, CoCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "CO.sheet.character",
  })
  Actors.registerSheet(SYSTEM.ID, CoEncounterSheet, {
    types: ["encounter"],
    makeDefault: true,
    label: "CO.sheet.encounter",
  })

  Items.registerSheet(SYSTEM.ID, applications.AttackSheet, { types: ["attack"], makeDefault: true })
  Items.registerSheet(SYSTEM.ID, applications.CapacitySheet, { types: ["capacity"], makeDefault: true })
  Items.registerSheet(SYSTEM.ID, applications.EquipmentSheet, { types: ["equipment"], makeDefault: true })
  Items.registerSheet(SYSTEM.ID, applications.FeatureSheet, { types: ["feature"], makeDefault: true })
  Items.registerSheet(SYSTEM.ID, applications.PathSheet, { types: ["path"], makeDefault: true })
  Items.registerSheet(SYSTEM.ID, applications.ProfileSheet, { types: ["profile"], makeDefault: true })

  // Preload Handlebars Templates
  preloadHandlebarsTemplates()

  // Register Handlebars helpers
  registerHandlebarsHelpers()

  // Register System Settings
  registerSystemSettings()

  // Register hooks
  registerHooks()

  // Load Martial Training
  if (!game.system.CONST.martialTrainingsWeapons) {
    game.system.CONST.martialTrainingsWeapons = []
  }
  if (!game.system.CONST.martialTrainingsArmors) {
    game.system.CONST.martialTrainingsArmors = []
  }
  if (!game.system.CONST.martialTrainingsShields) {
    game.system.CONST.martialTrainingsShields = []
  }

  // Initiative
  if (game.settings.get("co", "useVarInit")) {
    CONFIG.Combat.initiative = {
      formula: "1d6x + @combat.init.value + @abilities.wis.value/100",
      decimals: 2,
    }
  } else {
    CONFIG.Combat.initiative = {
      formula: "@combat.init.value + @abilities.wis.value/100",
      decimals: 2,
    }
  }

  console.info(Utils.log("Initialized"))
})

Hooks.once("ready", async function () {
  console.info(Utils.log(game.i18n.localize("CO.notif.ready")))
})
