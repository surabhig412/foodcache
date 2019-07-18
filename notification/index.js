const SlackClient = require("./slack");
const slack = new SlackClient();
const email = require("./email");

// TODO test with real token
class Notify {
    static adminBalance (mailID, channel, amount) {
        const message = "Balance Amount: Rs. " + amount;

        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: mailID,
            subject: "Foodcache details",
            text: message,
        };

        email.send(data);
        slack.notify(channel, message);
    }

    static paymentDue (mailID, channel, amountDue) {
        var message = "Please pay your dues for this month. Your total due amount is Rs. " + amountDue;

        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: mailID,
            subject: "Gentle reminder to pay monthly dues.",
            text: message,
        };

        email.send(data);
        slack.notify(channel, message);
    }

    static paymentReceived (mailID, channel, amount) {
        const message = "Received payment of Rs. " + amount;

        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: mailID,
            subject: "Received payment",
            text: message,
        };

        email.send(data);
        slack.notify(channel, message);
    }

    static itemPurchase (mailID, channel, items) {
        var message = "Food items purchased " + this.formatItems(items) + ". Come and check.";

        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: mailID,
            subject: "New food items purchased",
            text: message,
        };

        email.send(data);
        slack.notify(channel, message);
    }

    static formatItems (items) {
        var lastCommaIndex = items.lastIndexOf(",");
        if (lastCommaIndex !== -1) {
            items = "are " + items.substr(0, lastCommaIndex) + " and " + items.substr(lastCommaIndex + 1, items.length);
            return items.toLowerCase();
        } else {
            return "is " + items.toLowerCase();
        }
    }
}

module.exports = Notify;
