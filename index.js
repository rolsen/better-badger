
// const childProcess = require('child_process');

const path = require('path');
const {app, powerMonitor, BrowserWindow, ipcMain, Menu, Tray} =
  require('electron');

const RecurringAudioReminder = require('./lib/recurring_audio_reminder.js');

app.requestSingleInstanceLock();

// Globals
const appState = {
  appTray: null,
  recurringReminder: null,
};

/**
 * @return {string} Returns the local time. Might look like:
 * Thu Apr 23 2020 20:38:58 GMT-0600 (Mountain Daylight Time)
 */
function localTime() {
  return new Date().toString();
};


ipcMain.handle('set-interval-minutes', async (event, interval) => {
  try {
    await appState.recurringReminder.setIntervalMinutes(interval);
    return 'Saved';
  } catch (err) {
    console.log(err);
    return err.message;
  }
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

  /**
   * @param {obj} time Passed to RecurringAudioReminder::addTemporaryDisable
   */
  function addTemporaryDisable(time) {
    appState.recurringReminder.addTemporaryDisable(time);
    updateTray();
  }

  /**
   * Pulls all relevant state and updates the tray menu.
   */
  function updateTray() {
    const disableDeadline = appState.recurringReminder.temporaryDisableDeadline;
    const now = new Date();
    if (disableDeadline && disableDeadline > now) {
      const timeRemaining = disableDeadline.getTime() - now.getTime();
      const rem = Math.round(timeRemaining / 1000 / 60);
      appState.menuTemplate[4].label = `Clear disable - ${rem} minutes left`;
    } else {
      appState.menuTemplate[4].label = `Clear disable`;
    }

    const contextMenu = Menu.buildFromTemplate(appState.menuTemplate);
    appState.appTray.setContextMenu(contextMenu);
  };

  appState.menuTemplate = [
    {
      label: 'Show Configurations',
      click: () => {
        showConfigurationsWindow();
      },
    },
    {type: 'separator'},
    {
      label: 'Enabled',
      type: 'checkbox',
      checked: true,
      click: (menuItem) => {
        appState.recurringReminder.setEnableState(menuItem.checked);
      },
    },
    {
      label: 'Add time to temporary disable',
      submenu: [
        {
          label: 'Add 1 hour',
          click: () => {
            addTemporaryDisable({hours: 1});
          },
        },
        {
          label: 'Add 3 hour',
          click: () => {
            addTemporaryDisable({hours: 3});
          },
        },
        {
          label: 'Add 8 hour',
          click: () => {
            addTemporaryDisable({hours: 8});
          },
        },
      ],
    },
    {
      label: 'Clear disable',
      click: () => {
        appState.recurringReminder.clearDisableTimer();
        updateTray();
      },
    },
    {type: 'separator'},
    {
      label: 'Quit',
      role: 'quit',
    },
  ];

  const contextMenu = Menu.buildFromTemplate(appState.menuTemplate);

  appState.appTray.setToolTip('Better Badger');
  appState.appTray.setContextMenu(contextMenu);

  registerPowerMonitorEvents();
  appState.recurringReminder =
    new RecurringAudioReminder({
      enabled: true,
    });
});

app.on('window-all-closed', () => {
  // Nothing, we want the tray icon to continue to exist when the configuration
  // window is closed.
});
