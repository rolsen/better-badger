
// const childProcess = require('child_process');

const path = require('path');
const {app, powerMonitor, BrowserWindow, ipcMain, Menu, MenuItem, Tray} =
  require('electron');

const RecurringAudioReminder = require('./lib/recurring_audio_reminder.js');

// TODO: Try to break this
app.requestSingleInstanceLock();

// Globals
// TODO: Class
const appState = {
  appTray: null,
  recurringReminder: null,
  menu: {
    enabled: null,
  },
  enableDisableClosure: null,
};

appState.enableDisableClosure = function() {
  appState.recurringReminder.setEnableState(appState.menu.enabled.checked);
};

/**
 * @return {string} Returns the local time. Might look like:
 * Thu Apr 23 2020 20:38:58 GMT-0600 (Mountain Daylight Time)
 */
function localTime() {
  return new Date().toString();
};


ipcMain.handle('set-interval-minutes', async (event, interval) => {
  await appState.recurringReminder.setIntervalMinutes(interval);
  return 'Saved';
});

/**
 * Show the configurations window
 */
function showConfigurationsWindow() {
  const modalPath = path.join('file://', __dirname, 'windows/configurations.html');
  let win = new BrowserWindow({
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on('close', () => {
    win = null;
  });
  win.loadURL(modalPath);
  win.show();
};

/**
 * Ends the process by destroying state.
 */
function appShutdown() {
  // appState.appTray.destroy();
  // appState.recurringReminder.finalize();
  // appState = null;
  process.exit(0);
}


function registerPowerMonitorEvents() {
  const registerPmEventAsDebug = (name) => {
    powerMonitor.on(name, () => {
      console.log(localTime(), name);
    });
  };

  registerPmEventAsDebug('suspend');
  registerPmEventAsDebug('resume');
  registerPmEventAsDebug('on-ac');
  registerPmEventAsDebug('on-battery');
  registerPmEventAsDebug('shutdown');
  registerPmEventAsDebug('lock-screen');
  registerPmEventAsDebug('unlock-screen');

  powerMonitor.on('lock-screen', () => {
    // childProcess.exec('Fare thee well'); // Fails
    console.log('fare thee well');
  });
  powerMonitor.on('unlock-screen', () => {
    // childProcess.exec('Welcome');
    console.log('welcome');
  });
}

app.on('ready', (event) => {
  const iconName = 'resources/eye_clock_12_16x16.png';
  const iconPath = path.join(__dirname, iconName);
  appState.appTray = new Tray(iconPath);

  appState.menu.enabled = new MenuItem({
    label: 'Enabled',
    type: 'checkbox',
    checked: true,
    click: () => {
      appState.enableDisableClosure();
    },
  });
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({
    label: 'Show Configurations',
    click: () => {
      showConfigurationsWindow();
    },
  }));
  contextMenu.append(appState.menu.enabled);
  contextMenu.append(new MenuItem({
    label: 'Quit',
    click: () => {
      appShutdown();
    },
  }));

  appState.appTray.setToolTip('CareWare: Much blink. So wowowow.');
  appState.appTray.setContextMenu(contextMenu);

  registerPowerMonitorEvents();
  appState.recurringReminder =
    new RecurringAudioReminder(appState.menu.enabled.checked);
});

app.on('window-all-closed', () => {
  // Nothing, we want the tray icon to continue to exist when the configuration
  // window is closed.
});
