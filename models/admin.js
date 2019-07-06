const Sequelize = require("sequelize");

class Admin extends Sequelize.Model {
    static init (sequelize) {
        super.init(
            // attributes
            {
                username: {
                    type: Sequelize.STRING,
                },
                password: {
                    type: Sequelize.STRING,
                },
                amount_received: {
                    type: Sequelize.DECIMAL(15, 2),
                },
                email: {
                    type: Sequelize.STRING,
                },
                channel: {
                    type: Sequelize.STRING,
                },
            },
            // options
            {
                sequelize,
                tableName: "admin",
                timestamps: false,
            });
    }
}

module.exports = Admin;
