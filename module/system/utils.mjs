import { CO } from "./config.mjs";

export class Utils {
    static shortcutResolve(shortcut) {
        return shortcut.replace("@", "system.");
    };

    static getModFromValue = function (value) {
        return (value < 4) ? -4 : Math.floor(value / 2) - 5;
    };

    static getValueFromMod = function (mod) { return mod * 2 + 10; };

    static getTooltip (name, value) {
        if (name !== "" &&  value > 0) {
          return name + " : " + value + " ";
        }
        return "";
    }

    static getAbilityName (ability) {
        return game.i18n.localize(`CO.abilities.long.${ability}`);
    }
}