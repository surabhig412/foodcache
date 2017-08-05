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
      });
      connection.query("SHOW TABLES LIKE 'admin'", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
          createAdminTable(connection);
        }
        connection.end();
      });
    });
  });
}

var createTable = function(connection) {
    var sql = "CREATE TABLE foodies (serial_no INT AUTO_INCREMENT PRIMARY KEY, id VARCHAR(255), full_name VARCHAR(255), image_url VARCHAR(255), email VARCHAR(255), amount_due DECIMAL(15,2))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });
}

var createAdminTable = function(connection) {
    var sql = "CREATE TABLE admin (username VARCHAR(255), password VARCHAR(255), amount_received DECIMAL(15,2))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });
    var admin_details = {username: process.env.admin_user, password: process.env.admin_password, amount_received: 0};
    connection.query("INSERT into admin set ?", admin_details, function (err, result) {
      if (err) throw err;
    });
}

createDatabase();
