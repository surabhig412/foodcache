var schedule = require('node-schedule');
var api_key = '';
var domain = '';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var db = require('./db');

var j = schedule.scheduleJob('0 0 10 1 * *', function() {
  db.query("select email from foodies", function(err, result) {
    if(err) {
      console.log(err);
      return;
    }
    for(var email in result) {
      var data = {
        from: 'Best Before <donotreply@bestbefore.com>',
        to: result[email].email,
        subject: 'Gentle reminder to pay monthly dues.',
        text: 'Please pay an amount of Rs. 100 for this month'
      };

      mailgun.messages().send(data, function (error, body) {
        console.log(body);
      });
    }

  });
});

module.exports = j;
