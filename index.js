// index.js

const {app, powerMonitor} = require('electron');
const BetterBadger = require('./lib/better-badger.js');

app.requestSingleInstanceLock();

let badger;

app.on('ready', (event) => {
  badger = new BetterBadger();

  badger.on('ready', () => {
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
        console.log('fare thee well');
      });
      powerMonitor.on('unlock-screen', () => {
        console.log('welcome');
      });
    }

    registerPowerMonitorEvents();
  });
});

app.on('window-all-closed', () => {
  // Nothing, we want the tray icon to continue to exist when the
  // configuration window is closed.
});

