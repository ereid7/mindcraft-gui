/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';
import { exec } from 'child_process';



const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'config.json');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('load-agents', async () => {
  const agentsDir = path.join(__dirname, '..', '..', 'mindcraft', 'profiles');
  return fs.promises.readdir(agentsDir);
});

ipcMain.handle('create-agent', async (event, name) => {
  const templatePath = path.join(__dirname, '..', '..', 'mindcraft', 'andy.json');
  const newAgentPath = path.join(__dirname, '..', '..', 'mindcraft', 'profiles', `${name}.json`);
  
  const templateData = await fs.promises.readFile(templatePath, 'utf8');
  await fs.promises.writeFile(newAgentPath, templateData);
  return true;
});

ipcMain.handle('load-agent-config', async (event, name) => {
  const agentPath = path.join(__dirname, '..', '..', 'mindcraft', 'profiles', `${name}`);
  const configData = await fs.promises.readFile(agentPath, 'utf8');
  return JSON.parse(configData);
});

ipcMain.handle('save-agent-config', async (event, name, config) => {
  const agentPath = path.join(__dirname, '..', '..', 'mindcraft', 'profiles', `${name}`);
  await fs.promises.writeFile(agentPath, JSON.stringify(config, null, 2));
  return true;
});

ipcMain.handle('launch-agents', async (event, command) => {
  return new Promise((resolve, reject) => {
    const mindcraftPath = path.join(__dirname, '..', '..', 'mindcraft');
    
    // Load API keys
    let apiKeys = {};
    try {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      apiKeys = JSON.parse(data);
    } catch (error) {
      console.error('Error reading config file:', error);
    }

    // Create environment variables object
    const env = { ...process.env, ...apiKeys };

    console.log("EVAN TEST 2")
    console.log(env)

    const childProcess = exec(command, { cwd: mindcraftPath, env });

    childProcess.stdout?.on('data', (data) => {
      console.log(data.toString());
      event.sender.send('agent-output', data.toString());
    });

    childProcess.stderr?.on('data', (data) => {
      event.sender.send('agent-output', data.toString());
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve('Process completed successfully');
      } else {
        reject(`Process exited with code ${code}`);
      }
    });
  });
});

ipcMain.handle('get-api-keys', async () => {
  try {
    const data = await fs.promises.readFile(CONFIG_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    return {};
  }
});

ipcMain.handle('save-api-keys', async (event, keys) => {
  try {
    await fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(keys, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing config file:', error);
    return false;
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
