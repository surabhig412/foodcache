const Sequelize = require("sequelize");
const { Admin, FoodItem, Foodie, FoodStock } = require("./models");

class Database {
    constructor () {
        this.sql = new Sequelize("foodcache", process.env.mysql_user, process.env.mysql_password, {
            host: process.env.mysql_host,
            dialect: "mysql",
            // logging: console.log,
        });
    }

    async init () {
        try {
            await this.sql.authenticate();

            Admin.init(this.sql);
            FoodItem.init(this.sql);
            Foodie.init(this.sql);
            FoodStock.init(this.sql);
        } catch (err) {
            console.error("Unable to connect to the database:", err);
        }
    }
}

module.exports = Database;
