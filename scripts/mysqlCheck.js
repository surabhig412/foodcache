require("dotenv").config();

var mysql = require("mysql2");

var createDatabase = function () {
    var connection = mysql.createConnection({
        host: process.env.mysql_host,
        user: process.env.mysql_user,
        password: process.env.mysql_password,
    });

    connection.connect(function (err) {
        if (err) throw err;
        var sql = "CREATE DATABASE IF NOT EXISTS foodcache";
        connection.query(sql, function (err, result) {
            if (err) throw err;

            connection.end();
        });
    });
};

createDatabase();
