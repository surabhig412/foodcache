const Router = require("express").Router;
const router = new Router();

const { Admin, FoodItem, Foodie, FoodStock, } = require("../models");

const notify = require("../notification");

router.post("/login", async function (req, res) {
    try {
        const admin = await Admin.findOne();
        if (admin.username !== req.body.username || admin.password !== req.body.password) {
            res.redirect("/");
            return;
        }

        req.session.admin_login = true;
        res.redirect("/admin/details");
    } catch (err) {
        res.send(err);
    }
});

router.post("/logout", function (req, res) {
    req.session.admin_login = false;
    res.render("");
});

const checkAdminLoggedIn = function (req, res, next) {
    if (!req.session.admin_login) {
        res.redirect("/");
    }
    next();
};

router.use(checkAdminLoggedIn);

// below routers are using checkAdminLoggedIn

router.get("/details", async function (req, res) {
    try {
        var foodiesResult = await Foodie.findAll();
        foodiesResult = JSON.stringify(foodiesResult);

        const foodItems = await FoodItem.findAll();
        const fooditemsResult = JSON.stringify(foodItems);

        const foodstock = await FoodStock.findAll();
        const foodstockResult = JSON.stringify(foodstock);

        const result = await Admin.findAll({ attributes: [ "amount_received", ], limit: 1, });
        const adminResult = JSON.stringify(result);

        res.render("admin-details.jade", { foodies: JSON.parse(foodiesResult), admin_details: JSON.parse(adminResult), fooditems: JSON.parse(fooditemsResult), foodstock: JSON.parse(foodstockResult), });
    } catch (err) {
        res.send(err);
    }
});

router.post("/users/details/update", async function (req, res) {
    try {
        const admin = await Admin.findOne();
        admin.increment("amount_received", { by: req.body.amount, });

        const foodie = await Foodie.findOne({ where: { serial_no: req.body.serial_no, }, });

        foodie.amount_due = 0;
        await foodie.save();

        notify.paymentReceived(foodie.email, foodie.channel, req.body.amount);
        res.render("");
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.post("/users/details/edit", function (req, res) {
    try {
        Foodie.update({ amount_due: req.body.amount, }, { where: { serial_no: req.body.serial_no, }, });
        res.render("");
    } catch (err) {
        res.send(err);
    }
});

router.post("/users/notify", async function (req, res) {
    try {
        const foodies = await Foodie.findAll();
        for (let foodie of foodies) {
            if (foodie.amount_due !== 0) {
                notify.paymentDue(foodie.email, foodie.channel, foodie.amount_due);
            }
        }
        res.render("");
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.post("/items/purchase", function (req, res) {
    var fooditem = { items: req.body.items, description: req.body.description, amount: req.body.amount, };

    FoodItem.create(fooditem)
        .then(async () => {
            const admin = await Admin.findOne();
            admin.decrement("amount_received", { by: fooditem.amount, });

            const foodies = await Foodie.findAll();
            for (var foodie of foodies) {
                notify.itemPurchase(foodie.email, foodie.channel, req.body.items);
            }
            res.render("");
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

router.post("/foodstock/add", async function (req, res) {
    const foodstockItem = { fooditem: req.body.fooditem, };

    FoodStock.create(foodstockItem)
        .then(() => {
            res.render("");
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

router.post("/foodstock/delete", async function (req, res) {
    const itemID = { id: req.body.id, };

    FoodStock.destroy({ where: itemID, })
        .then(() => {
            res.render("");
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

module.exports = router;
