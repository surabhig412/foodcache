const { WebClient } = require('@slack/client');
const token = process.env.slack_token;
var web = new WebClient(token);

module.exports = web;
