var googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2;
    client = process.env.google_client_id,
    secret = process.env.google_client_secret,
    redirect = 'http://localhost:8071/redirect',
    calendar_auth_url = '',
    oauth2Client = new OAuth2(client, secret, redirect);

calendar_auth_url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'
});

module.exports = {
  url: calendar_auth_url,
  client: oauth2Client
};
