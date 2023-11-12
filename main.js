const { app, BrowserWindow, Menu, ipcMain, screen, shell } = require("electron");
const { join } = require("path");

require("./environments.js");

const { version: appVersion, vars } = require("./package.json");
 
// const isDebug = !app.isPackaged;
const isDebug = process.argv.indexOf("--developer") != -1;

if (isDebug) {
  require('electron-reload')(__dirname, {
    electron: join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

if (app.isPackaged) {
  process.env.IS_PACKAGE = true;

  const Sentry = require('@sentry/electron');
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
else {
  process.env.SENTRY_DSN = "" //não logar em modo desenvolvedor
}

let downloadsSaved = false;

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  let win = new BrowserWindow({
    title: `Udeler | Udemy Course Downloader - v${appVersion} ${process.env.SENTRY_DSN == undefined ? "" : " 🕘"}`,
    minWidth: 650,
    minHeight: 550,
    width: 650,
    height: size.height - 150,
    icon: "./app/assets/images/build/icon.png",
    resizable: true,
    maximizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: "./preload.js"
    }
  });

  win.loadFile("app/index.html");
  // win.webContents.on("did-finish-load", () => {
  //   // console.log("did-finish-load");
  //   win.setTitle(`Udeler | Udemy Course Downloader - v${appVersion}`);
  // });

  // Open the DevTools.
  if (isDebug) {
    win.openDevTools(); //{ mode: 'detach' });
    win.maximize();
  }

  // win.webContents.on('did-start-loading', (e) => {
  //   saveOnClose(e);
  // });

  win.on("close", event => {
    saveOnClose(event);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  const template = [
    {
      label: app.name,
      submenu: [
        // { role: "about" },
        // { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "View",
      submenu: [
        // { role: "reload" },
        { role: "forcereload" },
        // {
        //   label: 'Refresh',
        //   click: async () => {
        //     saveOnClose(null);
        //   }
        // },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: 'GitHub Repo',
      submenu: [
        {
          label: 'This Version',
          click: () => {
            shell.openExternal('https://github.com/heliomarpm/udemy-downloader-gui/releases')
          }
        },
        { type: "separator" },
        {
          label: 'Original (Archived)',
          click: () => {
            shell.openExternal('https://github.com/FaisalUmair/udemy-downloader-gui/releases')
          }
        }
      ]
    },
    {
      label: 'Donate',
      click: () => {
        shell.openExternal(urlDonateWithMsg(vars.urlDonate))
      }
    }
  ];

  //if (process.platform === "darwin") {
  // template.unshift({
  //   label: app.name,
  //   submenu: [
  //     { role: "about" },
  //     { type: "separator" },
  //     { role: "services", submenu: [] },
  //     { type: "separator" },
  //     { role: "hide" },
  //     { role: "hideothers" },
  //     { role: "unhide" },
  //     { type: "separator" },
  //     { role: "quit" }
  //   ]
  // });

  // template[1].submenu.push(
  //   { type: "separator" },
  //   {
  //     label: "Speech",
  //     submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
  //   }
  // );
  //}
  if (!isDebug) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  function saveOnClose(event = null) {
    if (!downloadsSaved) {
      downloadsSaved = true;
      if (event != null) { event.preventDefault(); }

      win.webContents.send("saveDownloads");
      console.log("saveOnClose", downloadsSaved)
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);

// app.on("activate", () => {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (win === null) {
//     createWindow();
//   }
// });

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on("quitApp", function () {
  app.quit();
});


function urlDonateWithMsg(baseUrl) {
  return `${baseUrl}&item_name=${("Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.").replace(" ", "+")}`
}