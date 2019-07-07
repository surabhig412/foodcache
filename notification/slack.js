const { WebClient } = require("@slack/client");

class SlackClient {
    constructor () {
        this.client = new WebClient(process.env.slack_token);
    }

    notify (channelID, message) {
        this.client.chat.postMessage({ channel: channelID, text: message })
            .then((res) => {
                console.log("Message sent: ", res);
            })
            .catch(console.error);
    }
}

module.exports = SlackClient;
