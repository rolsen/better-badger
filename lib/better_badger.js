// better-badger.js


const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const {BrowserWindow, ipcMain, Menu, Tray} = require('electron');
const plist = require('plist');

const RecurringAudioReminder = require('./recurring_audio_reminder.js');

const DEFAULT_ICON_PATH = path.join(
    __dirname, '..', 'resources', 'eye_clock_12_16x16.png');
const APP_NAME = 'Better Badger';

/**
 * Manger of the application and global state.
 */
class BetterBadger extends EventEmitter {
  /**
   * Initializes the application, including setting up event handlers.
   */
  constructor() {
    super();

    // https://stackoverflow.com/a/26227660/768536
    const localStoragePath = process.env.APPDATA || (
      process.platform == 'darwin' ?
        process.env.HOME + '/Library/Preferences' :
        process.env.HOME + '/.local/share'
    );
    this.appConfigFile = path.join(localStoragePath, 'better-badger.plist');
    let appConfigs = null;
    if (process.platform == 'darwin') {
      try {
        appConfigs = fs.readFileSync(this.appConfigFile, 'utf8');
      } catch (err) {
        if (!Object.prototype.hasOwnProperty.call(err, 'code') ||
            err.code != 'ENOENT') {
          throw err;
        }
      }
    }

    this.recurringReminder = null;
    this.enabled = true;

    this.appTray = new Tray(DEFAULT_ICON_PATH);
    this.appTray.setIgnoreDoubleClickEvents(true);

    this.appTray.setToolTip(APP_NAME);

    this.appTray.on('click', () => {
      this.showTray();
    });

    this.recurringReminder =
      new RecurringAudioReminder({
        enabled: this.enabled,
      });

    ipcMain.handle('set-interval-minutes', async (event, interval) => {
      try {
        await this.recurringReminder.setIntervalMinutes(interval);
        return 'Saved';
      } catch (err) {
        console.log(err);
        return err.message;
      }
    });

    setTimeout(() => {
      this.emit('ready');
    }, 0);

    if (appConfigs) {
      const configs = plist.parse(appConfigs);
      this.recurringReminder.setIntervalMinutes(configs.minutesPerReminder);
    } else {
      console.log(`No config file found. Tried: ${this.appConfigFile}`);
      this.saveToDisk();
    }
  }

  /**
   * @return {string} Returns the local time. Might look like:
   * Thu Apr 23 2020 20:38:58 GMT-0600 (Mountain Daylight Time)
   */
  static localTime() {
    return new Date().toString();
  }

  /**
   * Writes current app configurations to disk.
   */
  saveToDisk() {
    const data = {
      minutesPerReminder: this.recurringReminder.getIntervalminues(),
    };
    fs.writeFileSync(this.appConfigFile, plist.build(data));
  }

  /**
   * Show the configurations window
   */
  showConfigurationsWindow() {
    const modalPath = path.join(
        'file://', __dirname, '../windows/configurations.html');
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
  }

  /**
   * @param {obj} time Passed to RecurringAudioReminder::addTemporaryDisable
   */
  addTemporaryDisable(time) {
    this.recurringReminder.addTemporaryDisable(time);
  }

  /**
   * Pulls all relevant state and shows the current tray menu.
   */
  showTray() {
    const disableDeadline = this.recurringReminder.temporaryDisableDeadline;
    const now = new Date();
    let contextMenu = null;
    if (disableDeadline && disableDeadline > now) {
      const timeRemaining = disableDeadline.getTime() - now.getTime();
      const rem = Math.round(timeRemaining / 1000 / 60);
      contextMenu = this.generateContextMenu(rem);
    } else {
      contextMenu = this.generateContextMenu();
    }

    this.appTray.popUpContextMenu(contextMenu);
  }

  /**
   * Creates a tray context menu.
   * @param {number} tempMinutes The number of minutes remaining before disable
   *   ends.
   * @return {Menu}
   */
  generateContextMenu(tempMinutes = 0) {
    const template = [];
    template.push({
      label: 'Show Configurations',
      click: () => {
        this.showConfigurationsWindow();
      },
    });
    template.push({type: 'separator'});
    template.push({
      label: 'Enabled',
      type: 'checkbox',
      checked: this.enabled,
      click: (menuItem) => {
        this.enabled = menuItem.checked;
        this.recurringReminder.setEnableState(menuItem.checked);
      },
    });
    template.push({
      label: 'Add time to temporary disable',
      submenu: [
        {
          label: 'Add 1 hour',
          click: () => {
            this.addTemporaryDisable({hours: 1});
          },
        },
        {
          label: 'Add 3 hour',
          click: () => {
            this.addTemporaryDisable({hours: 3});
          },
        },
        {
          label: 'Add 8 hour',
          click: () => {
            this.addTemporaryDisable({hours: 8});
          },
        },
      ],
    });

    if (tempMinutes > 0) {
      const clearDisableLabel = `Clear disable - ${tempMinutes} minutes left`;
      template.push({
        label: clearDisableLabel,
        click: () => {
          this.recurringReminder.clearDisableTimer();
        },
      });
    }

    template.push({type: 'separator'});
    template.push({
      label: 'Quit',
      role: 'quit',
    });

    return Menu.buildFromTemplate(template);
  }
}

module.exports = BetterBadger;
