var mysql = require('mysql');

var createDatabase = function() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.mysql_user,
    password: process.env.mysql_password,
  });
  connection.connect(function(err) {
    if (err) throw err;
    var sql = "CREATE DATABASE IF NOT EXISTS bestBefore";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      connection.query("use bestBefore");
      connection.query("SHOW TABLES LIKE 'foodies'", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
          createTable(connection);
        }
        connection.end();
      });
    });
  });
}

var createTable = function(connection) {
    var sql = "CREATE TABLE foodies (id VARCHAR(255), full_name VARCHAR(255), image_url VARCHAR(255), email VARCHAR(255))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });
}

createDatabase();
