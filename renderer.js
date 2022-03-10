const settings = require("electron-settings");
const appVersion = require(__dirname + "/package.json").version;

function translate(text) {
    if (!settings.get("general.language") || settings.get("general.language") == "English") {
        return text;
    }
    else {
        try {
            var meta = require("./locale/meta.json");
            var locale = require(`./locale/${meta[settings.get("general.language")]}`);
            return locale[text] || text;
        }
        catch (e) {
            return text;
        }
    }
}

function translateWrite(text) {
    document.write(translate(text));
}