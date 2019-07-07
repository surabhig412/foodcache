const Sequelize = require("sequelize");

class FoodStock extends Sequelize.Model {
    static init (sequelize) {
        super.init(
            // attributes
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                fooditem: {
                    type: Sequelize.STRING,
                },
            },
            // options
            {
                sequelize,
                tableName: "foodstock",
                timestamps: false,
            });

        this.sync();
    }
}

module.exports = FoodStock;
