const Sequelize = require("sequelize");
const notify = require("../notification");

class Admin extends Sequelize.Model {
    static async init (sequelize) {
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
        await this.sync();

        await this.findOrCreate({
            raw: true,
            where: { email: process.env.admin_email },
            defaults: { username: process.env.admin_user, password: process.env.admin_password, amount_received: 0, email: process.env.admin_email, channel: process.env.admin_slack_channel },
        });
    }

    static async isAdmin (username, password) {
        const admin = await Admin.findOne();
        if (admin.username !== username || admin.password !== password) {
            return false;
        }
        return true;
    }

    static async notifyBalance () {
        const admin = await Admin.findOne();
        notify.adminBalance(admin.email, admin.channel, admin.amount_received);
    }
}

module.exports = Admin;
