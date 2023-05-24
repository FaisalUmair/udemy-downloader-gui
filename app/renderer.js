"use strict"

const Sentry = require('@sentry/electron');
const Settings = require('./js/settings.js')
const { version: appVersion, vars: pkgVars } = require('../package.json');

let featToggle = {};

fetch(pkgVars.urlToggles).then(resp => resp.json())
  .then(json => {
    featToggle = json;
    Sentry.init({ dsn: featToggle.enableSentry ? process.env.SENTRY_DSN : "" });
    console.log(featToggle.enableSentry ? "Sentry is enabled" : "Sentry is disabled");
  });

const localeMeta = require("./locale/meta.json");
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


function urlDonate() {
  return `${pkgVars.urlDonate}&item_name=${translate("Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.").replace(" ", "+")}`
}
