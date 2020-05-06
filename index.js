
// const childProcess = require('child_process');

const path = require('path');
const {app, powerMonitor, shell, Menu, Tray} = require('electron');

const RecurringAudioReminder = require('./lib/recurring_audio_reminder.js');

// TODO: Try to break this
app.requestSingleInstanceLock();

// Globals
let appIcon = null;
let recurringReminder;

/**
 * @return {string} Returns the local time. Might look like:
 * Thu Apr 23 2020 20:38:58 GMT-0600 (Mountain Daylight Time)
 */
function localTime() {
  return new Date().toString();
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
  appIcon = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Best',
    type: 'checkbox',
  }, {
    label: 'Beep',
    click: () => {
      shell.beep();
    },
  }, {
    label: 'Say Blink',
    click: () => {
      recurringReminder.reminder();
    },
  }]);

  appIcon.setToolTip('CareWare: Much blink. So wowowow.');
  appIcon.setContextMenu(contextMenu);

  registerPowerMonitorEvents();
  recurringReminder = new RecurringAudioReminder();
});

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy();
});
