import { CO } from "../system/config.mjs";

export const registerHandlebarsHelpers = function () {
  Handlebars.registerHelper("equals", function (a, b) {
    return a === b;
  });
  Handlebars.registerHelper("add", function (a, b) {
    return parseInt(a) + parseInt(b);
  });
  Handlebars.registerHelper("concat", function (a, b) {
    return a + b;
  });
  Handlebars.registerHelper("isset", function (value) {
    return value == undefined ? false : true;
  });
  Handlebars.registerHelper("not", function (value) {
    return !value;
  });
  Handlebars.registerHelper("sum", function (arr, init) {
    return arr.reduce((previousValue, currentValue) => previousValue + currentValue, init);
  });
  Handlebars.registerHelper("isProfileFamilyEnabled", function () {
    return CO.profile.family.enabled;
  });
  Handlebars.registerHelper("getKeyFromMartialTraining", function (training) {
    return training.key;
  });
  Handlebars.registerHelper("getValueFromMartialTraining", function (training) {
    return training.label;
  });
  Handlebars.registerHelper("getMartialTrainingLabel", function (training) {
    return game.i18n.localize(training.label);
  });
  Handlebars.registerHelper("buildItemTemplatePath", function (root, itemType) {
    return root + itemType + "/" + itemType + "-partial.hbs";
  });
  Handlebars.registerHelper("getEmbeddedItemName", function (actor, source) {
    const item = actor.items.get(source);
    return item.name;
  });
  Handlebars.registerHelper("getEmbeddedItemImg", function (actor, source) {
    const item = actor.items.get(source);
    return item.img;
  });
  Handlebars.registerHelper("getActionImg", function (action, actor, source) {
    if (action.img !== "icons/svg/d20-highlight.svg") return action.img;
    const item = actor.items.get(source);
    return item.img;
  });
  Handlebars.registerHelper("isActionable", function (itemType) {
    const actionableItemTypes = ["capacity", "equipment", "attack"];
    return actionableItemTypes.includes(itemType);
  });
  Handlebars.registerHelper("isNegativeOrNull", function (value) {
    return value >= 0;
  });
  Handlebars.registerHelper("getActionIcon", function (action) {
    switch (action.type) {
      case "spell":
        return '<i class="fas fa-fw fa-hand-sparkles"></i>';
      case "melee":
        return '<i class="fas fa-fw fa-sword"></i>';
      case "ranged":
        return '<i class="fas fa-fw fa-bow-arrow"></i>';
      case "magical":
        return '<i class="fa-solid fa-bolt"></i>';
      case "protection":
        return '<i class="fa-regular fa-fw fa-shield"></i>';
        break;
      case "heal":
        return '<i class="fas fa-fw fa-hand-holding-medical"></i>';
        break;
    }
  });
  Handlebars.registerHelper("isEnabled", function (configKey) {
    const value = game.settings.get("co", configKey);
    if (value === false || value === "none") return false;
    return true;
  });
};
