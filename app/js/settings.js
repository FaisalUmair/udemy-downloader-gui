
const Settings = {};

(() => {
    "use strict"

    const settings = require("electron-settings");
    const { join } = require("path");
    const { homedir } = require("os");

    const downloadType = {
        LecturesAndAttachments: 0,
        OnlyLectures: 1,
        OnlyAttachments: 2
    }
    const downloadDefaultOptions = {
        checkNewVersion: true,
        autoStartDownload: false,
        continueDonwloadingEncrypted: false,
        enableDownloadStartEnd: false,
        downFiles: downloadType.LecturesAndAttachments,
        skipSubtitles: false,
        autoRetry: false,
        downloadStart: false,
        downloadEnd: false,
        videoQuality: "Auto",
        path: join(homedir(), "Downloads"),
        defaultSubtitle: "",
        seqZeroLeft: false,
    }

    let definedLanguage;

    /**
     * Ensures all keys are set
     * @interna
     */
    function ensureDefaultKeys() {
        if (!settings.get("general")) {
            settings.set("general", {
                language: getLanguage()
            });
        }

        if (!settings.get("download")) {
            settings.set("download", downloadDefaultOptions);
        } else {
            console.log("garante que todas as chaves estejam definidas");
            // certifica que exista todas as propriedades
            Object.keys(downloadDefaultOptions).forEach(key => {
                settings.get(`download.${key}`, downloadDefaultOptions[key]);
            });
        }
    }

    /**
     * Get navigator default language and set in settings "general.language"
     * 
     * @returns defined language
     */
    function getLanguage() {

        try {
            let language = settings.get("general.language");

            if (!language) {
                let loc = navigator.language.substring(0, 2);
                loc = loc === 'pt' ? 'pt_BR.json' : `${loc}.json`;

                const meta = require("../locale/meta.json");

                Object.keys(meta).forEach(key => {
                    if (meta[key] === loc) {
                        language = key;
                        settings.set("general.language", key);
                        console.log("general.language", key);
                        return key;
                    }
                });
            }

            return language;

        } catch (error) {
            console.error("Error_Settings getLanguage(): " + error);
        }

    };

    function downloadDirectory(courseName = "") {
        const download_dir = settings.get("download.path") || downloadDefaultOptions.path;
        return join(download_dir, courseName);
    }

    const init = () => {
        console.log('Initialize settings');
        ensureDefaultKeys();
    };

    init();

    Settings.get = (keyPath, defaultValue = undefined) => settings.get(keyPath, defaultValue);
    Settings.set = (keyPath, value) => settings.set(keyPath, value);

    Settings.language = getLanguage() || "English";
    Settings.subDomain = (value) => (value !== undefined ? settings.set("subdomain", value) : settings.get("subdomain", "www")) ?? value;
    Settings.accessToken = (value) => (value !== undefined ? settings.set("access_token", value) : settings.get("access_token")) ?? value;
    Settings.subscriber = (value) => (value !== undefined ? settings.set("subscriber", value) : settings.get("subscriber")) ?? value;

    Settings.downloadType = downloadType;
    Settings.general = (value) => (value !== undefined ? settings.set("general", value) : settings.get("general")) ?? value;
    Settings.download = (value) => (value !== undefined ? settings.set("download", value) : settings.get("download")) ?? value;
    Settings.downloadHistory = (value) => (value !== undefined ? settings.set("downloadedHistory", value) : settings.get("downloadedHistory")) ?? value;
    Settings.downloadedCourses = (value) => (value !== undefined ? settings.set("downloadedCourses", value) : settings.get("downloadedCourses")) ?? value;

    Settings.downloadDirectory = (courseName) => downloadDirectory(courseName || "");
})();

module.exports = Settings;