var mysql = require("mysql");

var migrateDatabase = function () {
    var connection = mysql.createConnection({
        host: process.env.mysql_host,
        user: process.env.mysql_user,
        password: process.env.mysql_password,
        database: "foodcache",
    });
    connection.connect(function (err) {
        if (err) throw err;
        connection.query("ALTER TABLE admin ADD COLUMN email VARCHAR(255), ADD COLUMN channel VARCHAR(255)", function (err, result) {
            if (err) throw err;
            connection.end();
        });
    });
};

migrateDatabase();
