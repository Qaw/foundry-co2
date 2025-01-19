/**
 * Register Handlebars helpers
 */
export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("add", function (a, b) {
    return parseInt(a) + parseInt(b)
  })
  Handlebars.registerHelper("concat", function (a, b) {
    return a + b
  })
  Handlebars.registerHelper("isset", function (value) {
    return value !== undefined
  })
  Handlebars.registerHelper("sum", function (arr, init) {
    return arr.reduce((previousValue, currentValue) => previousValue + currentValue, init)
  })
  Handlebars.registerHelper("getKeyFromMartialTraining", function (training) {
    return training.key
  })
  Handlebars.registerHelper("getValueFromMartialTraining", function (training) {
    return training.label
  })
  Handlebars.registerHelper("getMartialTrainingLabel", function (training) {
    return game.i18n.localize(training.label)
  })
  Handlebars.registerHelper("buildItemTemplatePath", function (root, itemType) {
    return `${root}${itemType}-partial.hbs`
  })
  Handlebars.registerHelper("isActionable", function (itemType) {
    const actionableItemTypes = ["capacity", "equipment", "attack"]
    return actionableItemTypes.includes(itemType)
  })
  Handlebars.registerHelper("isNegativeOrNull", function (value) {
    return value >= 0
  })
  Handlebars.registerHelper("isEnabled", function (configKey) {
    const value = game.settings.get("co", configKey)
    if (value === false || value === "none") return false
    return true
  })
}
