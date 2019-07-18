const apiKey = process.env.mailgun_key;
const domain = process.env.mailgun_domain;

const mailgun = require("mailgun-js")({ apiKey: apiKey, domain: domain });

class EMail {
    static send (data) {
        mailgun.messages().send(data, function (error, body) {
            console.error(error);
        });
    }
}

module.exports = EMail;
