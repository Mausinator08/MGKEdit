/** @module main */

//#region Imports
import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

// Uncomment the following line later when ini settings files are being used.
// import * as ini from "multi-ini";
//#endregion

//#region Globals
/** The main window to render the game to. Probably the only one as well. */
let mainWindow: Electron.BrowserWindow;
//#endregion

//#region Method Exports
// Create a window...
/**
 *
 *
 */
function createWindow(): void {
    // Will use "multi-ini" later to retrieve user's system settings and apply
    // the settings for the window to below.
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: true,
        },
        minWidth: 800,
        minHeight: 600,
        width: 1280,
        height: 720,
        title: "MGK Edit"
    });

    // Load index.html for the main window.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "/../content/index.html"),
        protocol: "file:",
        slashes: true,
    }));

    // Open DevTools... will add a check for an entry in ini for
    // ExecuteDevMode=1
    // If the above exists, then devTools will open on launch.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
//#endregion

//#region Global Executions
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
});

// That's all for now.
// More code may be added below as project grows.
//#endregion
