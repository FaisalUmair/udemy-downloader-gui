"use strict"

const Sentry = require('@sentry/electron');
const Settings = require(__dirname + "/assets/js/settings.js")
const { version: appVersion, vars: pkgVars } = require(__dirname + "/package.json");

let featToggle = {} ;

fetch(pkgVars.urlToggles).then(resp => resp.json())
    .then(json => {
        featToggle = json;
        Sentry.init({ dsn: featToggle.enableSentry ? process.env.SENTRY_DSN : "" });
        console.log( featToggle.enableSentry ? "Sentry is enabled" : "Sentry is disabled" );
    });

const localeMeta = require(__dirname + "/locale/meta.json");
let localeJson;

function translate(text) {
    const language = Settings.language;

    if (language == "English") {
        return text;
    }
    else {
        try {
            if (!localeJson) {
                localeJson = require(`./locale/${localeMeta[language]}`);
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
