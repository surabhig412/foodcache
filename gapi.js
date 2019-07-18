var googleapis = require("googleapis"),
    OAuth2 = googleapis.auth.OAuth2;
client = process.env.google_client_id,
secret = process.env.google_client_secret,
redirect = process.env.google_redirect_url,
auth_url = "",
oauth2Client = new OAuth2(client, secret, redirect);

auth_url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
});

module.exports = {
    url: auth_url,
    client: oauth2Client,
};
