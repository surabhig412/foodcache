const Sequelize = require("sequelize");
const notify = require("../notification");

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

    async addMonthlyDue (amount) {
        this.amount_due = parseFloat(this.amount_due) + amount;
        await this.save();

        this.notifyPaymentDue();
    }

    async paymentReceived () {
        this.amount_due = 0;
        await this.save();

        this.notifyPaymentReceived();
    }

    notifyPaymentReceived (amount) {
        notify.paymentReceived(this.email, this.channel, amount);
    }

    notifyItemPurchase (items) {
        notify.itemPurchase(this.email, this.channel, items);
    }

    notifyPaymentDue () {
        if (this.amount_due !== 0) {
            notify.paymentDue(this.email, this.channel, this.amount_due);
        }
    }

    static async notifyAllAboutPurchase (items) {
        const foodies = await Foodie.findAll();
        for (let foodie of foodies) {
            foodie.notifyItemPurchase(items);
        }
    }

    static async notifyAllPaymentDue () {
        const foodies = await Foodie.findAll();
        for (let foodie of foodies) {
            foodie.notifyPaymentDue();
        }
    }
}

module.exports = Foodie;
