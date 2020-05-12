const childProcess = require('child_process');

/** Class representing a recurring audio reminder. */
class RecurringAudioReminder /* extends Event? */ {
  /**
   * Initializes this instance and starts a recurring reminder.
   * Caller is responsible for eventually calling finalize()
   * @param {bool} enabled Specifies whether the reminder should be output.
   */
  constructor(enabled) {
    // Local time, inclusive
    this.times = {
      start: {'hour': 7, 'minute': 30},
      end: {'hour': 21, 'minute': 45},
    };
    // this.reminder = reminder;
    const minutesPerReminder = 20;
    this.setIntervalMinutes(minutesPerReminder);
    this.reminderText = 'blink';
    this.verbose = true;
    this.enabled = enabled;

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

    const SECONDS_PER_MINUTE = 60;
    const MS_PER_SECOND = 1000;
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
    if (this.enabled &&
      RecurringAudioReminder.isTime(this.times, new Date())
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
