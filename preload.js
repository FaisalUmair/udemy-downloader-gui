// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
//https://www.electronjs.org/docs/latest/tutorial/tutorial-preload
// const { contextBridge } = require('electron');

// contextBridge.exposeInMainWorld('Sentry', {
//     captureException: (exception, context = undefined) => Sentry.captureException(exception, context),
//     captureMessage: (message) => Sentry.captureMessage(message)
// });

// const { contextBridge, app } = require('electron');

// contextBridge.exposeInMainWorld('AppEnviron', {
//     userDataPath: app.getPath("userData"),
//     tempPath: app.getPath("temp"),
//     appDataPath: app.getPath("appData"),
//     isMac: process.platform === "darwin",
//     isWin: process.platform === "win32",
//     isLinux: process.platform === "linux",
// });