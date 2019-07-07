const Sequelize = require("sequelize");

class Admin extends Sequelize.Model {
    static init (sequelize) {
        super.init(
            // attributes
            {
                username: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
                password: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
                amount_received: {
                    type: Sequelize.DECIMAL(15, 2),
                    primaryKey: true,
                },
                email: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
                channel: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                },
            },
            // options
            {
                sequelize,
                tableName: "admin",
                timestamps: false,
            });
    }

    static async isAdmin (username, password) {
        const admin = await Admin.findOne();
        if (admin.username !== username || admin.password !== password) {
            return false;
        }
        return true;
    }
}

module.exports = Admin;
