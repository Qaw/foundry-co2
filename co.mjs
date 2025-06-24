// Configuration
import { SYSTEM } from "./module/config/system.mjs"
globalThis.SYSTEM = SYSTEM

export * as elements from "./module/elements/_module.mjs"

// Import modules
import * as models from "./module/models/_module.mjs"
import * as documents from "./module/documents/_module.mjs"
import * as applications from "./module/applications/_module.mjs"

// Helpers
import preloadHandlebarsTemplates from "./module/templates.mjs"
import registerHandlebarsHelpers from "./module/helpers.mjs"
import registerSystemSettings from "./module/settings.mjs"
import registerHooks from "./module/hooks.mjs"
import Macros from "./module/macros.mjs"
import Utils from "./module/utils.mjs"
import { handleSocketEvent } from "./module/socket.mjs"

Hooks.once("init", async function () {
  console.info(SYSTEM.ASCII)
  console.info(Utils.log("Initializing..."))

  globalThis.cof = game.system
  game.system.CONST = SYSTEM

  // Expose the system API
  game.system.api = {
    applications,
    models,
    documents,
    macros: Macros,
  }

  // Actor
  CONFIG.Actor.documentClass = documents.COActor

  CONFIG.Actor.dataModels = {
    character: models.CharacterData,
    encounter: models.EncounterData,
  }

  foundry.documents.collections.Actors.unregisterSheet("core", ActorSheet)
  foundry.documents.collections.Actors.registerSheet(SYSTEM.ID, applications.CharacterSheetV2, { types: ["character"], makeDefault: true, label: "CO.sheet.character" })
  foundry.documents.collections.Actors.registerSheet(SYSTEM.ID, applications.EncounterSheetV2, { types: ["encounter"], makeDefault: true, label: "CO.sheet.encounter" })

  // Item
  CONFIG.Item.documentClass = documents.COItem

  CONFIG.Item.dataModels = {
    capacity: models.CapacityData,
    equipment: models.EquipmentData,
    feature: models.FeatureData,
    profile: models.ProfileData,
    path: models.PathData,
    attack: models.AttackData,
  }

  foundry.documents.collections.Items.unregisterSheet("core", ItemSheet)
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.AttackSheet, { types: ["attack"], makeDefault: true, label: "CO.sheet.attack" })
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.CapacitySheet, { types: ["capacity"], makeDefault: true, label: "CO.sheet.capacity" })
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.EquipmentSheet, { types: ["equipment"], makeDefault: true, label: "CO.sheet.equipment" })
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.FeatureSheet, { types: ["feature"], makeDefault: true, label: "CO.sheet.feature" })
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.PathSheet, { types: ["path"], makeDefault: true, label: "CO.sheet.path" })
  foundry.documents.collections.Items.registerSheet(SYSTEM.ID, applications.ProfileSheet, { types: ["profile"], makeDefault: true, label: "CO.sheet.profile" })

  // Chat
  CONFIG.ChatMessage.documentClass = documents.COChatMessage

  CONFIG.ChatMessage.dataModels = {
    base: models.BaseMessageData,
    action: models.ActionMessageData,
    item: models.ItemMessageData,
    skill: models.SkillMessageData,
  }

  // Status Effects
  CONFIG.statusEffects = SYSTEM.STATUS_EFFECT

  // Dice system configuration
  CONFIG.Dice.rolls.push(documents.CORoll, documents.COSkillRoll, documents.COAttackRoll)

  // Activate socket handler
  game.socket.on(`system.${SYSTEM.ID}`, handleSocketEvent)

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

  // Combat tracker
  if (game.settings.get("co", "usevarInit")) {
    CONFIG.Combat.initiative = {
      formula: "1d6x + @combat.init.value",
      decimals: 0,
    }
  } else {
    CONFIG.Combat.initiative = {
      formula: "@combat.init.value",
      decimals: 0,
    }
  }
  CONFIG.Combat.documentClass = documents.CombatCO
  // Un round dure 6s
  CONFIG.time.roundTime = 6
  console.info(Utils.log("Initialized"))
})

/* -------------------------------------------- */
/*  Localization                                */
/* -------------------------------------------- */

Hooks.once("i18nInit", function () {
  // Traduction du tableau des conditions
  const customeffects = CONFIG.statusEffects.map((element) => {
    return {
      ...element,
      name: game.i18n.localize(element.name),
      description: game.i18n.localize(element.description),
    }
  })

  customeffects.sort((a, b) => a.name.localeCompare(b.name))
  CONFIG.statusEffects = customeffects
})

Hooks.once("ready", async function () {
  if (!CONFIG.debug.co) {
    if (game.settings.get("co", "debugMode")) {
      CONFIG.debug.co = {
        hooks: true,
        resolvers: true,
        rolls: true,
        sheets: true,
        actions: true,
        chat: true,
      }
    } else
      CONFIG.debug.co = {
        hooks: false,
        resolvers: false,
        rolls: false,
        sheets: false,
        actions: false,
        chat: false,
      }
  }
  console.info(Utils.log(game.i18n.localize("CO.notif.ready")))
})
