const Router = require("express").Router;
const router = new Router();

const { FoodStock, FoodItem, Admin, } = require("../models");
var db = require("../db");

const notify = require("../notification");

router.post("/login", function (req, res) {
    db.query("select * from admin", function (err, result) {
        if (err) res.send(err);
        if (result[0].username !== req.body.username || result[0].password !== req.body.password) {
            res.redirect("/");
            return;
        }
        req.session.admin_login = true;
        res.redirect("/admin/details");
    });
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
    var foodiesResult;
    db.query("select * from foodies", function (err, result) {
        if (err) res.send(err);
        foodiesResult = JSON.stringify(result);
    });

    try {
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
    const admin = await Admin.findOne({ limit: 1, });
    admin.increment("amount_received", { by: req.body.amount, });

    db.query("update foodies set amount_due = 0 where serial_no = ?", req.body.serial_no, function (err, result) {
        if (err) res.send(err);
    });
    db.query("select * from foodies where serial_no = ?", req.body.serial_no, function (err, result) {
        if (err) res.send(err);
        notify.paymentReceived(result[0].email, result[0].channel, req.body.amount);
        res.render("");
    });
});

router.post("/users/details/edit", function (req, res) {
    db.query("update foodies set amount_due = ? where serial_no = ?", [ req.body.amount, req.body.serial_no, ], function (err, result) {
        if (err) {
            res.send(err);
        }
        res.render("");
    });
});

router.post("/users/notify", function (req, res) {
    db.query("select * from foodies", function (err, result) {
        if (err) {
            res.send(err);
        }
        for (let foodie of result) {
            if (foodie.amount_due !== 0) {
                notify.paymentDue(foodie.email, foodie.channel, foodie.amount_due);
            }
        }
        res.render("");
    });
});

router.post("/items/purchase", function (req, res) {
    var fooditem = { items: req.body.items, description: req.body.description, amount: req.body.amount, };

    FoodItem.create(fooditem)
        .then(async () => {
            const admin = await Admin.findOne({ limit: 1, });
            admin.decrement("amount_received", { by: fooditem.amount, });
        })
        .then(() => {
            db.query("select * from foodies", function (err, result) {
                if (err) res.send(err);
                for (var foodie of result) {
                    notify.itemPurchase(foodie.email, foodie.channel, req.body.items);
                }
                res.render("");
            });
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
