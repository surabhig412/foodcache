# Foodcache
[![DeepScan grade](https://deepscan.io/api/teams/4676/projects/6427/branches/53364/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=4676&pid=6427&bid=53364)
![David](https://img.shields.io/david/souvikmaji/foodcache.svg)

Application to keep track of money paid and received for office pantry. It gives monthly email alerts to all its users. The admin of this application can handle accounts and can view which users still owe money.

# Prerequisites

* Mysql

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

* Install the dependencies
```
npm install
```


* Start the application
```
npm start
```
