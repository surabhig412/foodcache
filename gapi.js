var googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2;
    client = '',
    secret = '',
    redirect = 'http://localhost:8071/redirect',
    calendar_auth_url = '',
    oauth2Client = new OAuth2(client, secret, redirect);

calendar_auth_url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'
});

// googleapis.discover('calendar', 'v3').discover('oauth2', 'v2').execute(function(err, client){
//     if(!err) callback(client);
//   });

module.exports = {
  url: calendar_auth_url,
  client: oauth2Client
};
