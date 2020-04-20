
const childProcess = require('child_process');

const path = require('path');
const {app, shell, Menu, Tray} = require('electron');
app.requestSingleInstanceLock();

let appIcon = null;

app.on('ready', (event) => {
  const iconName = 'iconTemplate.png';
  console.log('__dirname', __dirname);
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
      childProcess.exec('say blink');
    },
  }]);

  appIcon.setToolTip('CareWare: Much blink. So wowowow.');
  appIcon.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy();
});
