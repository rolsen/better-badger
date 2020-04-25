
const childProcess = require('child_process');

const path = require('path');
const {app, powerMonitor, shell, Menu, Tray} = require('electron');
app.requestSingleInstanceLock();

let appIcon = null;

const minutesPerReminder = 10;
const idleSeconds = 600;

/**
 * Outputs the audio reminder.
 */
function reminder() {
  childProcess.exec('say blink');
}

/**
 * @returns {string} Returns the local time. Might look like:
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

/**
 * The main reminder interval.
 */
function startBlinkReminder() {
  setInterval(() => {
    let powerState = powerMonitor.getSystemIdleState(idleSeconds);
    if (powerState === 'active') {
      console.log(localTime(), 'Reminding');
      reminder();
    }
    else {
      console.log(localTime(), `No reminder power state was: ${powerState}`);
    }
  }, minutesPerReminder * 60 * 1000);
}

app.on('ready', (event) => {
  const iconName = 'iconTemplate.png';
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
      reminder();
    },
  }]);

  appIcon.setToolTip('CareWare: Much blink. So wowowow.');
  appIcon.setContextMenu(contextMenu);

  registerPowerMonitorEvents();
  startBlinkReminder();
  reminder();
});

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy();
});
