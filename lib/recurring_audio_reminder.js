const childProcess = require('child_process');

const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;

/** Class representing a recurring audio reminder. */
class RecurringAudioReminder /* extends Event? */ {
  /**
   * Initializes this instance and starts a recurring reminder.
   * Caller is responsible for eventually calling finalize()
   * @param {bool} enabled Specifies whether the reminder should be output.
   */
  constructor({
    enabled = true,
    times = {
      start: {'hour': 7, 'minute': 30},
      end: {'hour': 21, 'minute': 45},
    },
    minutesPerReminder = 20,
    reminderText = 'blink',
    temporaryDisableDeadline = null,
    verbose = true,
  } = {}) {
    // TODO: Validate input

    // Local time, inclusive
    this.times = times;
    // this.reminder = reminder;
    this.setIntervalMinutes(minutesPerReminder);
    this.reminderText = reminderText;
    this.verbose = verbose;
    this.enabled = enabled;
    this.temporaryDisableDeadline = temporaryDisableDeadline;

    if (this.verbose) {
      childProcess.exec(`say ${this.reminderText} reminder started.`);
    }
  }

  /**
   * End the audio reminder.
   */
  finalize() {
    this.clearReminder();
  }

  /**
   * End the reminder interval if it's currently set.
   */
  clearReminder() {
    if (typeof this.intervalId === 'object') {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Sets or resets the interval for the reminder.
   * @param {number} minutes The new interval length.
   * Does not store/apply progress on the previous interval.
   */
  setIntervalMinutes(minutes) {
    this.clearReminder();

    this.intervalMs = minutes * SECONDS_PER_MINUTE * MS_PER_SECOND;
    this.startRecurringReminder();
  }

  /**
   * Sets whether or not this object will output a reminder or not.
   * @param {bool} enabled True if this object should output a reminder, false
   *   otherwise.
   */
  setEnableState(enabled) {
    this.enabled = enabled;
  }

  /**
   * Cumulatively adds time to the temporary disable
   * @param {obj} time Of the form {'minutes': minutes, 'hours': hours}
   * Where minutes and hours are optional of type {number}.
   */
  addTemporaryDisable(time) {
    const now = new Date();
    if (this.temporaryDisableDeadline !== null ||
      this.temporaryDisableDeadline < now
    ) {
      this.temporaryDisableDeadline = now;
    }

    let msToAdd = 0;
    if (time.hasOwnProperty('hours')) {
      msToAdd += time.hours * 60 * 60 * 1000;
    }
    if (time.hasOwnProperty('minutes')) {
      msToAdd += time.minutes * 60 * 1000;
    }

    const deadline = this.temporaryDisableDeadline.getTime() + msToAdd;
    this.temporaryDisableDeadline.setTime(deadline);
  }

  /**
   * Clears the disable timer.
   * TODO: Decide: clean this.enable?
   */
  clearDisableTimer() {
    this.temporaryDisableDeadline = null;
  }

  /**
   * Starts the main reminder interval.
   */
  startRecurringReminder() {
    this.intervalId = setInterval(() => {
      this.conditionalReminder();
      // const powerState = powerMonitor.getSystemIdleState(idleSeconds);
      // if (powerState === 'active') {
      //   console.log(localTime(), 'Reminding');
      //   reminder();
      // } else {
      //   console.log(localTime(), `No reminder power state was:
      //   ${powerState}`);
      // }
    }, this.intervalMs);
  }

  /**
   * @param {Obj} times Start and end time of the form:
   * {
   *   start: {'hour': 7, 'minute': 30},
   *   end: {'hour': 21, 'minute': 45},
   * }
   * @param {Date} now The current time (or test time).
   * @return {bool} Returns `true` if `now` is between the start and end time,
   *         `false` otherwise.
   */
  static isTime(times, now) {
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    const start = times.start;
    const end = times.end;

    if (nowHour == start.hour && nowMinute >= start.minute) {
      return true;
    } else if (nowHour > start.hour && nowHour < end.hour) {
      return true;
    } else if (nowHour == end.hour && nowMinute <= end.minute) {
      return true;
    }
    return false;
  }

  /**
   * Outputs the reminder, if conditions are appropriate.
   */
  conditionalReminder() {
    const now = new Date();
    if (this.enabled &&
      RecurringAudioReminder.isTime(this.times, now) &&
      (
        this.temporaryDisableDeadline === null ||
        this.temporaryDisableDeadline < now
      )
    ) {
      this.reminder();
    }
  }

  /**
   * Outputs the audio reminder.
   */
  reminder() {
    const localTime = new Date().toString();
    if (this.verbose) {
      console.log(`${localTime} - interval: ${this.intervalMs}` +
        `, reminder: ${this.reminderText}`);
    }
    childProcess.exec(`say ${this.reminderText}`);
  }
}

module.exports = RecurringAudioReminder;
