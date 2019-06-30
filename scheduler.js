var schedule = require("node-schedule");
var api_key = process.env.mailgun_key;
var domain = process.env.mailgun_domain;
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain, });
var db = require("./db");
var slack = require("./slack");

var j = schedule.scheduleJob("0 0 10 1 * *", function () {
    var foodies_result = "";
    db.query("update foodies set amount_due = amount_due + 150", function (err, result) {
        if (err) {
            console.log(err);
        }
    });
    db.query("select * from foodies", function (err, result) {
        if (err) {
            console.log(err);
            return;
        }

        for (var index in result) {
            foodies_result += result[index].full_name + ": Rs. " + result[index].amount_due + "\n";
            var message = "Please pay an amount of Rs. 150 for this month. Your total due amount is Rs. " + result[index].amount_due;
            var data = {
                from: "Foodcache <donotreply@foodcache.com>",
                to: result[index].email,
                subject: "Gentle reminder to pay monthly dues.",
                text: message,
            };

            mailgun.messages().send(data, function (error, body) {
                console.log(body);
            });

            const channelID = result[index].channel;
            slack.chat.postMessage({ channel: channelID, text: message, })
                .then((res) => {
                    console.log("Message sent: ", res);
                })
                .catch(console.error);
        }
    });

    db.query("select * from admin", function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        foodies_result += "Balance Amount: Rs. " + result[0].amount_received;

        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: result[0].email,
            subject: "Foodcache details",
            text: foodies_result,
        };

        mailgun.messages().send(data, function (error, body) {
            console.log(body);
        });

        const channelID = result[0].channel;
        slack.chat.postMessage({ channel: channelID, text: foodies_result, })
            .then((res) => {
                console.log("Message sent: ", res);
            })
            .catch(console.error);
    });
});

module.exports = j;
