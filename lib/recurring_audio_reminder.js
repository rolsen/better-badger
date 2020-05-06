const childProcess = require('child_process');

/** Class representing a recurring audio reminder. */
class RecurringAudioReminder /* extends Event? */ {
  /**
   * Initializes this instance and starts a recurring reminder.
   * Caller is responsible for eventually calling finalize()
   */
  constructor(enabled) {
    // Local time, inclusive
    this.times = {
      start: {'hour': 7, 'minute': 30},
      end: {'hour': 21, 'minute': 45},
    };
    // this.reminder = reminder;
    const minutesPerReminder = 20;
    this.intervalMs = 1000; //minutesPerReminder * 60 * 1000;
    this.reminderText = 'blink';
    this.verbose = true;
    console.log('constructor', enabled)
    this.enabled = enabled;

    this.startRecurringReminder();
    if (this.verbose) {
      childProcess.exec(`say ${this.reminderText} reminder started.`);
    }
  }

  /**
   * End the audio reminder.
   */
  finalize() {
    if (typeof this.intervalId === 'object') {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Sets whether or not this object will output a reminder or not.
   * @para {bool} enabled True if this object should output a reminder, false
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
    if (this.enabled
      && RecurringAudioReminder.isTime(this.times, new Date())
    ) {
      this.reminder();
    }
  }

  /**
   * Outputs the audio reminder.
   */
  reminder() {
    childProcess.exec(`say ${this.reminderText}`);
  }
}

module.exports = RecurringAudioReminder;
