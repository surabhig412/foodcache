const foodStock = require("./foodstock");
const foodItem = require("./fooditem");
const admin = require("./admin");

const models = {
    FoodStock: foodStock,
    FoodItem: foodItem,
    Admin: admin,
};

module.exports = models;
