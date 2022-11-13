export class Stats {
    static getModFromValue(value) {
        return (value < 4) ? -4 : Math.floor(value / 2) - 5;
    };
    static getValueFromMod(mod) {
        return mod * 2 + 10;
    };
}