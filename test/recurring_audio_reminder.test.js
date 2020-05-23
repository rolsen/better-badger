const RecurringAudioReminder = require('../lib/recurring_audio_reminder.js');

const assert = require('assert');

/**
 * @param {number} hours The hour, in local time.
 * @param {number} minutes The minute, in local time.
 * @param {number} [seconds=0] The second, in local time.
 * @return {Date} A Datetime in local time.
 */
function createLocalDatetime(hours, minutes, seconds = 0) {
  const date = new Date('April 26, 2020 03:24:00');
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  return date;
}

/**
 * @param {callable} func The function to test. Should throw an error.
 * @return {*|null} Returns whatever is thrown or null if no error is thrown.
 */
function throwTester(func) {
  try {
    func();
  } catch (error) {
    return error;
  }
  return null;
}

describe('RecurringAudioReminder', function() {
  const tests = [
    {
      desc: 'true - just barely started',
      time: createLocalDatetime(7, 30, 0),
      res: true,
    }, {
      desc: 'false - just before started',
      time: createLocalDatetime(7, 29, 59),
      res: false,
    }, {
      desc: 'true - midway between start and end',
      time: createLocalDatetime(12, 0),
      res: true,
    }, {
      desc: 'true - just before end',
      time: createLocalDatetime(21, 45),
      res: true,
    }, {
      desc: 'false - just after end',
      time: createLocalDatetime(21, 46),
      res: false,
    }, {
      desc: 'false - midway between end and start',
      time: createLocalDatetime(4, 0),
      res: false,
    },
  ];

  const dayPeriod = {
    start: {'hour': 7, 'minute': 30},
    end: {'hour': 21, 'minute': 45},
  };

  describe('#isTime() - day time reminder', function() {
    tests.forEach(function(test) {
      it(test['desc'], function() {
        assert.equal(RecurringAudioReminder.isTime(dayPeriod, test['time']),
            test['res']);
      });
    });
  });
});

describe('RecurringAudioReminder', function() {
  let reminder;
  beforeEach(function() {
    reminder = new RecurringAudioReminder({verbose: false});
  });
  afterEach(function() {
    reminder.finalize();
    delete reminder;
  });
  describe('#addTemporaryDisable', function() {
    it('should cumulatively add time', function() {
      // Testing temporaryDisableDeadline directly is quick n dirty.
      assert.equal(reminder.temporaryDisableDeadline, null);

      const now = new Date();
      reminder.addTemporaryDisable({hours: 1});
      assert.ok(reminder.temporaryDisableDeadline);
      const nowPlusHour = now.getTime() + 1000 * 60 * 60;
      assert.ok(
          reminder.temporaryDisableDeadline.getTime() >= nowPlusHour,
          'temporaryDisableDeadline should be an hour ahead of now');

      assert.ok(
          reminder.temporaryDisableDeadline.getTime() < nowPlusHour + 1000,
          'PlusHour - should not be not ahead by over a second');

      reminder.addTemporaryDisable({hours: 1});
      assert.ok(reminder.temporaryDisableDeadline);
      const nowPlusTwoHours = nowPlusHour + 1000 * 60 * 60;

      assert.ok(
          reminder.temporaryDisableDeadline.getTime() >= nowPlusTwoHours,
          'temporaryDisableDeadline should be two hours ahead of now');

      assert.ok(
          reminder.temporaryDisableDeadline.getTime() < nowPlusTwoHours + 1000,
          'PlusTwoHours - should not be not ahead by over a second');

      reminder.addTemporaryDisable({minutes: 3});
      assert.ok(reminder.temporaryDisableDeadline);
      const nowPlus123Minutes = nowPlusTwoHours + 1000 * 60 * 3;

      assert.ok(
          reminder.temporaryDisableDeadline.getTime() >= nowPlus123Minutes,
          'temporaryDisableDeadline should be 123 minutes ahead of now');

      assert.ok(
          reminder.temporaryDisableDeadline.getTime() <
            nowPlus123Minutes + 1000,
          'Plus123Minutes - should not be not ahead by over a second');

      reminder.clearDisableTimer();

      assert.equal(reminder.temporaryDisableDeadline, null);
    });

    it('should throw an error upon null input', function() {
      const error = throwTester(() => {
        reminder.addTemporaryDisable();
      });
      assert.ok(error instanceof TypeError);
    });

    it('should throw an error upon empty object as input', function() {
      const error = throwTester(() => {
        reminder.addTemporaryDisable({});
      });
      assert.ok(error instanceof TypeError);
    });

    it('should throw an error upon mistyped parameter key', function() {
      const error = throwTester(() => {
        reminder.addTemporaryDisable({'hourz': 3});
      });
      assert.ok(error instanceof TypeError);
    });
  });
});
