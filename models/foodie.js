const Sequelize = require("sequelize");

class Foodie extends Sequelize.Model {
    static init (sequelize) {
        super.init(
            // attributes
            {
                serial_no: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                id: {
                    type: Sequelize.INTEGER,
                },
                full_name: {
                    type: Sequelize.STRING, // refers to foodstock.fooditem
                },
                image_url: {
                    type: Sequelize.STRING,
                },
                email: {
                    type: Sequelize.STRING,
                },
                amount_due: {
                    type: Sequelize.DECIMAL(15, 2),
                },
                channel: {
                    type: Sequelize.STRING,
                },

            },
            // options
            {
                sequelize,
                tableName: "foodies",
                timestamps: false,
            });
    }
}

module.exports = Foodie;
