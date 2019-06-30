var mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env.mysql_host,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: "foodcache",
});

connection.connect();

module.exports = connection;
