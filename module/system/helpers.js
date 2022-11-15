export const registerHandlebarsHelpers = function () {
  Handlebars.registerHelper("add", function (a, b) {
    return parseInt(a) + parseInt(b);
  });
};
