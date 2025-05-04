import { SYSTEM } from "./config/system.mjs"

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export default function preloadHandlebarsTemplates() {
  const templatePaths = [
    // Common
    `systems/${SYSTEM.ID}/templates/actors/parts/actor-paths.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/parts/actor-capacities.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/parts/actor-effects.hbs`,

    // Character
    `systems/${SYSTEM.ID}/templates/actors/character/character-sheet.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/character/parts/character-bio.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/character/parts/character-details.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/character/parts/character-inventory.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/character/parts/character-main.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/character/parts/character-sidebar.hbs`,

    // Encounter
    `systems/${SYSTEM.ID}/templates/actors/encounter/encounter-sheet.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/encounter/parts/encounter-data.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/encounter/parts/encounter-loot.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/encounter/parts/encounter-main.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/encounter/parts/encounter-notes.hbs`,
    `systems/${SYSTEM.ID}/templates/actors/encounter/parts/encounter-sidebar.hbs`,

    // ITEM
    `systems/${SYSTEM.ID}/templates/items/item-sheet.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/attack-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/capacity-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/equipment-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/feature-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/path-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/profile-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/actions/action-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/actions/conditions-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/actions/resolvers-partial.hbs`,
    `systems/${SYSTEM.ID}/templates/items/parts/actions/modifiers-partial.hbs`,
  ]

  // Load the template parts
  return loadTemplates(templatePaths)
}
