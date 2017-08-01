var mysql = require('mysql');

var createDatabase = function() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
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
    var sql = "CREATE TABLE foodies (id VARCHAR(255), full_name VARCHAR(255), given_name VARCHAR(255), family_name VARCHAR(255), image_url VARCHAR(255), email VARCHAR(255), token VARCHAR(255))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });
}

createDatabase();
