const settings = require("electron-settings");
const { version: appVersion, urlHelp } = require(__dirname + "/package.json");

// Initialize settings
loadDefaultSettings();
loadDefaultSettingsDownload();

let localeJson;
let langCache = false;

function translate(text) {
    const language = getLanguage() || "English";

    if (language == "English") {
        return text;
    }
    else {
        try {
            if (!localeJson) {
                const meta = require("./locale/meta.json");
                localeJson = require(`./locale/${meta[language]}`);
            }

            return localeJson[text] || text;
        }
        catch (e) {
            console.error(e);
            return text;
        }
    }
}

function translateWrite(text) {
    document.write(translate(text));
}

function loadDefaultSettings() {
    if (!settings.get("general")) {
        settings.set("general", {
            language: getLanguage()
        });

        loadDefaultSettingsDownload(true);
    }
}

function loadDefaultSettingsDownload(force) {
    if (!settings.get("general") || force) {
        settings.set("download", {
            checkNewVersion: true,
            autoStartDownload: false,
            continueDonwloadingEncrypted: false,
            enableDownloadStartEnd: false,
            downFiles: 0,
            skipSubtitles: false,
            autoRetry: false,
            downloadStart: false,
            downloadEnd: false,
            videoQuality: "Auto",
            path: false,
            defaultSubtitle: "",
            seqZeroLeft: false,
        });
    }
}

function getLanguage() {
    try {
        if (!langCache) {
        
            langCache = settings.get("general.language");
            console.log("getLanguage", langCache);

            if (!langCache) {
                let loc = navigator.language.substring(0, 2);
                loc = loc === 'pt' ? 'pt_BR.json' : `${loc}.json`;

                const meta = require("./locale/meta.json");

                Object.keys(meta).forEach(key => {
                    if (meta[key] === loc) {
                        settings.set("general.language", key);
                        return key;
                    }
                });
            }
        }
        
        return langCache;

    } catch (error) {
        console.error(error);
    }
}
