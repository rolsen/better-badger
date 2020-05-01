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
