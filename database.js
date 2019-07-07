const Sequelize = require("sequelize");
const { Admin, FoodItem, Foodie, FoodStock } = require("./models");

class Database {
    constructor () {
        this.sql = new Sequelize("foodcache", process.env.mysql_user, process.env.mysql_password, {
            host: process.env.mysql_host,
            dialect: "mysql",
            // logging: console.log,
        });

        this.sql.authenticate()
            .then(() => {
                // console.log("Connection has been established successfully.");
                this.init(this.sql);
            })
            .catch(err => {
                console.error("Unable to connect to the database:", err);
            });
    }

    init (sql) {
        this.Admin = Admin.init(sql);
        this.FoodItem = FoodItem.init(sql);
        this.Foodie = Foodie.init(sql);
        this.FoodStock = FoodStock.init(sql);
    }
}

module.exports = Database;
