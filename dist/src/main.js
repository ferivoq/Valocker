"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const package_json_1 = require("../package.json");
const appName = electron_1.app.getPath("exe");
const expressAppUrl = "http://127.0.0.1:3000";
let mainWindow;
const expressPath = appName.endsWith(`${package_json_1.name}.exe`)
    ? path_1.default.join("./resources/app.asar", "./dist/src/express-app.js")
    : "./dist/src/express-app.js";
function stripAnsiColors(text) {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
}
function redirectOutput(stream) {
    stream.on("data", (data) => {
        if (!mainWindow)
            return;
        data.toString().split("\n").forEach((line) => {
            if (line !== "") {
                mainWindow.webContents.send("server-log-entry", stripAnsiColors(line));
            }
        });
    });
}
function registerGlobalShortcuts() {
    electron_1.globalShortcut.register("CommandOrControl+Shift+L", () => {
        mainWindow.webContents.send("show-server-log");
    });
}
function unregisterAllShortcuts() {
    electron_1.globalShortcut.unregisterAll();
}
function createWindow() {
    const expressAppProcess = (0, child_process_1.spawn)(appName, [expressPath], { env: { ELECTRON_RUN_AS_NODE: "1" } });
    [expressAppProcess.stdout, expressAppProcess.stderr].forEach(redirectOutput);
    mainWindow = new electron_1.BrowserWindow({
        autoHideMenuBar: true,
        width: 640,
        height: 480,
        icon: path_1.default.join(__dirname, "..", "favicon.ico"),
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
        expressAppProcess.kill();
    });
    mainWindow.on("focus", registerGlobalShortcuts);
    mainWindow.on("blur", unregisterAllShortcuts);
    electron_1.ipcMain.handle("get-express-app-url", () => expressAppUrl);
    mainWindow.loadURL(`file://${__dirname}/../index.html`);
}
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.whenReady().then(() => {
    registerGlobalShortcuts();
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    const checkServerRunning = setInterval(() => {
        (0, node_fetch_1.default)(expressAppUrl)
            .then((response) => {
            if (response.status === 200) {
                clearInterval(checkServerRunning);
                mainWindow.webContents.send("server-running");
            }
        })
            .catch(() => { }); // swallow exception
    }, 1000);
});
