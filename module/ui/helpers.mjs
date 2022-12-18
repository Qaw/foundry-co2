import { CO } from "../system/config.mjs";

export const registerHandlebarsHelpers = function () {
    Handlebars.registerHelper("add", function (a, b) {
        return parseInt(a) + parseInt(b);
    });
    Handlebars.registerHelper("concat", function (a, b) {
        return a + b;
    });
    Handlebars.registerHelper("sum", function (arr, init) {
        return arr.reduce((previousValue, currentValue) => previousValue + currentValue, init);
    });
    Handlebars.registerHelper("isProfileFamilyEnabled", function () {
        return CO.profile.family.enabled;
    });
};
