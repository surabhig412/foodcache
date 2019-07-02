// TODO: replace db.js later

const Sequelize = require("sequelize");

const sql = new Sequelize("foodcache", process.env.mysql_user, process.env.mysql_password, {
    host: process.env.mysql_host,
    dialect: "mysql",
});

sql.authenticate()
    .then(() => {
        console.log("Connection has been established successfully.");
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

module.exports = sql;
