const Router = require("express").Router;
const router = new Router();

var { FoodStock, FoodItem, } = require("../models");
var db = require("../db");

const notify = require("../notification");

router.get("/details", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        var foodiesResult, fooditemsResult, foodstockResult;
        db.query("select * from foodies", function (err, result) {
            if (err) res.send(err);
            foodiesResult = JSON.stringify(result);
        });

        FoodItem.findAll()
            .then(foodItems => {
                fooditemsResult = JSON.stringify(foodItems);
            })
            .then(() => {
                return FoodStock.findAll();
            })
            .then(foodstock => {
                foodstockResult = JSON.stringify(foodstock);
            })
            .then(() => {
                db.query("select amount_received from admin", function (err, result) {
                    if (err) res.send(err);
                    var adminResult = JSON.stringify(result);
                    res.render("admin-details.jade", { foodies: JSON.parse(foodiesResult), admin_details: JSON.parse(adminResult), fooditems: JSON.parse(fooditemsResult), foodstock: JSON.parse(foodstockResult), });
                });
            })
            .catch(err => {
                res.send(err);
            });
    }
});

router.post("/users/details/update", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        db.query("update admin set amount_received = amount_received + ?", req.body.amount, function (err, result) {
            if (err) res.send(err);
        });
        db.query("update foodies set amount_due = 0 where serial_no = ?", req.body.serial_no, function (err, result) {
            if (err) res.send(err);
        });
        db.query("select * from foodies where serial_no = ?", req.body.serial_no, function (err, result) {
            if (err) res.send(err);
            notify.paymentReceived(result[0].email, result[0].channel, req.body.amount);
            res.render("");
        });
    }
});

router.post("/users/details/edit", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        db.query("update foodies set amount_due = ? where serial_no = ?", [ req.body.amount, req.body.serial_no, ], function (err, result) {
            if (err) {
                res.send(err);
            }
            res.render("");
        });
    }
});

router.post("/users/notify", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
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
    }
});

router.post("/items/purchase", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        var fooditem = { items: req.body.items, description: req.body.description, amount: req.body.amount, };

        FoodItem.create(fooditem)
            .catch(err => {
                res.send(err);
            });
        db.query("update admin set amount_received = amount_received - ?", fooditem.amount, function (err, result) {
            if (err) res.send(err);
        });
        db.query("select * from foodies", function (err, result) {
            if (err) res.send(err);
            for (var foodie of result) {
                notify.itemPurchase(foodie.email, foodie.channel, req.body.items);
            }
            res.render("");
        });
    }
});

router.post("/foodstock/add", async function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        const foodstockItem = { fooditem: req.body.fooditem, };

        FoodStock.create(foodstockItem)
            .then(() => {
                res.render("");
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
    }
});

router.post("/foodstock/delete", async function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        const itemID = { id: req.body.id, };

        FoodStock.destroy({ where: itemID, })
            .then(() => {
                res.render("");
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
    }
});

var checkAdminLoggedIn = function (req, res) {
    if (req.session.admin_login === undefined || req.session.admin_login === false) {
        res.redirect("/");
        return false;
    }
    return true;
};

module.exports = router;