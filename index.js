const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const appVersion = require(__dirname + "/package.json").version;

const httpDonate = "https://www.paypal.com/donate?business=KBVHLR7Z9V7B2&no_recurring=0&item_name=Udeler%20is%20free%20and%20without%20any%20ads.%20If%20you%20appreciate%20that,%20please%20consider%20donating%20to%20the%20Developer.&currency_code=USD";

// const isDebug = !app.isPackaged;
const isDebug = process.argv.indexOf("--debug") != -1;

if (isDebug) {
  console.log("Development environment");

  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

var downloadsSaved = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 588,
    height: 700,
    //icon: __dirname + "/assets/images/build/icon.png",
    resizable: isDebug,
    webPreferences: {
      nodeIntegration: true
    }
  });


  // and load the index.html of the app.
  // win.loadURL(
  //   url.format({
  //     pathname: path.join(__dirname, "index.html"),
  //     protocol: "file:",
  //     slashes: true
  //   })
  // );
  win.loadFile("index.html");
  win.setTitle(`Udeler | Udemy Course Downloader - v${appVersion}`);

  // Open the DevTools.
  // win.webContents.openDevTools();  
  if (isDebug) {
    win.webContents.openDevTools();
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
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/heliomarpm/udemy-downloader-gui/releases')
          }
        },
        { type: "separator" },
        {
          label: 'Original (Archived)',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/FaisalUmair/udemy-downloader-gui/releases')
          }
        }
      ]
    },
    {
      label: 'Donate',
      click: async () => {
        const { shell } = require('electron')
        await shell.openExternal(httpDonate)
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

