// index.js

const child_process = require('child_process');

const {app, powerMonitor} = require('electron');
const BetterBadger = require('./lib/better-badger.js');

app.requestSingleInstanceLock();

let badger;

app.on('ready', (event) => {
  badger = new BetterBadger();

  const registerPmEventAsDebug = (name) => {
    powerMonitor.on(name, () => {
      console.log(BetterBadger.localTime(), name);
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
    child_process.exec('say Maybe charge the mouse')
  });
  powerMonitor.on('unlock-screen', () => {
    child_process.exec('say "It\'s goal time!"')
  });
});

app.on('window-all-closed', () => {
  // Nothing, we want the tray icon to continue to exist when the
  // configuration window is closed.
});

