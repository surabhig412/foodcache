const Sequelize = require("sequelize");

class FoodItem extends Sequelize.Model {
    static init (sequelize) {
        super.init(
            // attributes
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                items: {
                    type: Sequelize.STRING, // refers to foodstock.fooditem
                },
                description: {
                    type: Sequelize.STRING,
                },
                amount: {
                    type: Sequelize.DECIMAL(15, 2),
                },
            },
            // options
            {
                sequelize,
                tableName: "fooditems",
                timestamps: false,
            });
    }
}

module.exports = FoodItem;
