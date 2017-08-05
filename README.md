# node-best-before
A simple application in nodeJS which keeps track of money paid and received for a pantry. It also gives monthly email alerts to all its users. The admin of this application can handle accounts and can view which users still owe money.

# Prerequisites

* Mysql database

* Mailgun key credentials

* Google clientID and client secret for Oauth Authorization of the web application. You can create your credentials from [here](https://developers.google.com/adwords/api/docs/guides/authentication#webapp).

# Steps to run the application

* Set the following environment variables:
  * export google_client_id=`<give your google clientID>`
  * export google_client_secret=`<give your google client secret>`
  * export mailgun_key=`<your mailgun api key>`
  * export mailgun_domain=`<your mailgun domain>`
  * export mysql_user=`<your mysql user>`
  * export mysql_password=`<your mysql password>`
  * export admin_user=`<application admin username>`
  * export admin_password=`<application admin password>`

* npm install

* npm start
