/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
import { SYSTEM_NAME } from "../system/constants.mjs";

export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // ACTOR
    "systems/" + SYSTEM_NAME + "/templates/actors/character-sheet.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-sidebar.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-features.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-stats.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-actions.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/inventory/character-inventory.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/paths/character-paths.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/paths/character-capacities.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-effects.hbs",
    "systems/" + SYSTEM_NAME + "/templates/actors/parts/character-bio.hbs",

    // EFFECTS
    "systems/" + SYSTEM_NAME + "/templates/effects/effects.hbs",
    "systems/" + SYSTEM_NAME + "/templates/effects/effects-item.hbs",

    // ITEM
    "systems/" + SYSTEM_NAME + "/templates/items/item-sheet.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/item-sidebar.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/equipment/equipment-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/feature/feature-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/profile/profile-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/path/path-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/capacity/capacity-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/actions/action-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/actions/conditions-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/actions/resolvers-partial.hbs",
    "systems/" + SYSTEM_NAME + "/templates/items/parts/actions/modifiers-partial.hbs"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
