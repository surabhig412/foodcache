# foodcache
A simple application in nodeJS which keeps track of money paid and received for a pantry. It also gives monthly email alerts to all its users. The admin of this application can handle accounts and can view which users still owe money.

# Prerequisites

* Mysql database

* Mailgun key credentials

* Google clientID and client secret for Oauth Authorization of the web application. You can create your credentials from [here](https://developers.google.com/adwords/api/docs/guides/authentication#webapp).

# Steps to run the application

* Create a `.env` file at the project root with the following:
```
google_client_id=<give your google clientID>
google_client_secret=<give your google client secret>
google_redirect_url=<your domain name>/redirect
mailgun_key=<your mailgun api key>
mailgun_domain=<your mailgun domain>
mysql_user=<your mysql user>
mysql_password=<your mysql password>
mysql_host=<your mysql host>
admin_user=<application admin username>
admin_password=<application admin password>
admin_email=<application admin email>
admin_slack_channel=<application admin slack channel ID>
slack_token=<your slack token>
```

You can manually export the environment variables also.

* npm install

* npm start
