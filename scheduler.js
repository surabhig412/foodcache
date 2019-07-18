require("dotenv").config();

var schedule = require("node-schedule");

const Database = require("./database");
const { Admin, Foodie } = require("./models");

const database = new Database();
database.init();

var j = schedule.scheduleJob("0 0 10 1 * *", async function () {
    try {
        let foodies = await Foodie.findAll();
        for (let foodie of foodies) {
            foodie.addMonthlyDue(150.00);
        }

        Admin.notifyBalance();
    } catch (err) {
        console.error("error", err);
    }
});

module.exports = j;
