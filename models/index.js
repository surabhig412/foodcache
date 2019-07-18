const foodStock = require("./foodstock");
const foodItem = require("./fooditem");
const admin = require("./admin");
const foodie = require("./foodie");

const models = {
    FoodStock: foodStock,
    FoodItem: foodItem,
    Admin: admin,
    Foodie: foodie,
};

module.exports = models;
