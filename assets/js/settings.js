
const Settings = {};

(() => {
    "use strict"

    const settings = require("electron-settings");
    const { join } = require("path");
    const { homedir } = require("os");

    let cached = null;
    let langCache = false;

    const downloadType = {
        LecturesAndAttachments: 0,
        OnlyLectures: 1,
        OnlyAttachments: 2
    }

    function loadDefaultSettings() {
        // console.log('loadDefaultSettings()');
        if (!settings.get("general")) {
            settings.set("general", {
                language: getLanguage()
            });

            setDefaultSettingsDownload(true);
            loadCached(true)
        }
        else {
            loadCached()
        }
    };

    function setDefaultSettingsDownload(force) {
        // console.log('loadDefaultSettingsDownload()');
        if (!settings.get("general") || force) {
            settings.set("download", {
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
                path: join(homedir, "Downloads"),
                defaultSubtitle: "",
                seqZeroLeft: false,
            });
        }
    }

    function getLanguage() {
        
        try {
            if (!langCache) {

                langCache = settings.get("general.language");
                // console.log("getLanguage", langCache);

                if (!langCache) {
                    let loc = navigator.language.substring(0, 2);
                    loc = loc === 'pt' ? 'pt_BR.json' : `${loc}.json`;

                    const meta = require("../../locale/meta.json");

                    Object.keys(meta).forEach(key => {
                        if (meta[key] === loc) {
                            settings.set("general.language", key);
                            return key;
                        }
                    });
                }
            }

            // console.log('Language =>', langCache);
            return langCache;

        } catch (error) {
            console.error("Error_Settings getLanguage(): " + error);
        }

    };

    const loadCached = (reload = false) => {
        if (!cached || reload) {
            cached = settings.getAll();
        }
        return cached;
    };

    function downloadDirectory(courseName = "") {
        const download_dir = settings.get("download.path") || join(homedir, "Downloads");
        return join(download_dir, courseName);
      }

    const init = () => {
        console.log('Initialize settings');
        loadDefaultSettings();
        setDefaultSettingsDownload();
    };


    init();

    Settings.get = (keyPath, defaultValue = undefined) => settings.get(keyPath, defaultValue);
    Settings.set = (keyPath, value) => settings.set(keyPath, value);

    Settings.language = getLanguage() || "English";
    Settings.subDomain = (value) => (value !== undefined ? settings.set("subdomain", value) : settings.get("subdomain", "www")) ?? value;
    Settings.accessToken = (value) => (value !== undefined ? settings.set("access_token", value) : settings.get("access_token")) ?? value;
    Settings.subscriber = (value) => (value !== undefined ?settings.set("subscriber", value) : settings.get("subscriber")) ?? value;

    Settings.downloadType = downloadType;
    Settings.general = (value) =>  (value !== undefined ?settings.set("general", value) : settings.get("general")) ?? value;
    Settings.download = (value) =>  (value !== undefined ?settings.set("download", value) : settings.get("download")) ?? value;
    Settings.downloadHistory = (value) =>  (value !== undefined ?settings.set("downloadedHistory", value) : settings.get("downloadedHistory")) ?? value;
    Settings.downloadedCourses = (value) => (value !== undefined ? settings.set("downloadedCourses", value) : settings.get("downloadedCourses")) ?? value;
    
    Settings.downloadDirectory = (courseName = "") => downloadDirectory(courseName);
})();

module.exports = Settings;