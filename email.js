const apiKey = process.env.mailgun_key;
const domain = process.env.mailgun_domain;

const mailgun = require("mailgun-js")({ apiKey: apiKey, domain: domain, });

class EMail {
    static send (data) {
        mailgun.messages().send(data, function (error, body) {
            console.log(error);
        });
    }

    static notifyPaymentDue (email, message) {
        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: email,
            subject: "Gentle reminder to pay monthly dues.",
            text: message,
        };

        this.send(data);
    }

    static notifyPaymentReceived (email, message) {
        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: email,
            subject: "Received payment",
            text: message,
        };

        this.send(data);
    }

    static notifyItemPurchase (email, message) {
        var data = {
            from: "Foodcache <donotreply@foodcache.com>",
            to: email,
            subject: "New food items purchased",
            text: message,
        };

        this.send(data);
    }
}

module.exports = EMail;
