const {ipcRenderer} = require('electron');

const applyBtn = document.getElementById('setIntervalApply');
applyBtn.addEventListener('click', setIntervalMinutes);

/**
 * Gets the interval length from the DOM and sends it to the main process.
 */
function setIntervalMinutes() {
  const minutesEl = document.getElementById('intervalLength');
  const interval = minutesEl.valueAsNumber;
  ipcRenderer.invoke('set-interval-minutes', interval)
      .then((res) => {
        const messageEl = document.getElementById('setIntervalMessage');
        messageEl.innerHTML = res;

        if (messageEl.className === 'fadeMessage') {
          messageEl.className = 'showMessage';
        }
        if (res === 'Saved') {
          setTimeout(() => {
            messageEl.className = 'fadeMessage';
          }, 250);
        }
      })
      .catch((error) => {
        console.log('setIntervalMinutes caught', error);
      });
}
