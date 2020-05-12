const {ipcRenderer} = require('electron');

const applyBtn = document.getElementById('setIntervalApply');
applyBtn.addEventListener('click', setIntervalMinutes);

/**
 * Gets the interval length from the DOM and sends it to the main process.
 */
function setIntervalMinutes() {
  const minutesEl = document.getElementById('intervalLength');
  ipcRenderer.send('set-interval-minutes', minutesEl.valueAsNumber);
}
