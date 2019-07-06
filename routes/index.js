const Router = require("express").Router;
var gapi = require("../gapi");

const googleapis = require("googleapis");
const plus = googleapis.plus("v1");

var db = require("../db");
var { FoodStock, FoodItem, } = require("../models");

const notify = require("../notification");

const router = new Router();

router.get("/", function (req, res) {
    var locals = {
        title: "FoodCache",
        url: gapi.url,
    };
    res.render("index.jade", locals);
});

router.get("/redirect", function (req, res) {
    var code = req.query.code;
    gapi.client.getToken(code, function (err, tokens) {
        if (err) {
            res.send(err);
        }
        gapi.client.credentials = tokens;
        plus.people.get({
            userId: "me",
            auth: gapi.client,
        }, function (err, response) {
            if (err) {
                res.send(err);
            } else {
                db.query("select * from foodies where email = ?", response.emails[0].value, function (err, result) {
                    if (err) res.send(err);
                    var foodie = { id: response.id, full_name: response.displayName, image_url: response.image.url, email: response.emails[0].value, amount_due: 0, };
                    if (result.length === 0) {
                        db.query("insert into foodies set ?", foodie, function (err, result) {
                            if (err) res.send(err);
                        });
                    } else {
                        foodie["amount_due"] = result[0].amount_due;
                    }
                    res.render("profile.jade", foodie);
                });
            }
        });
    });
});

router.post("/admin-login", function (req, res) {
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

router.get("/admin/details", function (req, res) {
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

router.post("/admin/users/details/update", function (req, res) {
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

router.post("/admin/users/details/edit", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        db.query("update foodies set amount_due = ? where serial_no = ?", [ req.body.amount, req.body.serial_no, ], function (err, result) {
            if (err) {
                res.send(err);
            }
            res.render("");
        });
    }
});

router.post("/admin/users/notify", function (req, res) {
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

router.post("/admin/items/purchase", function (req, res) {
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

router.post("/admin/foodstock/add", async function (req, res) {
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

router.post("/admin/foodstock/delete", async function (req, res) {
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

router.post("/logout", function (req, res) {
    res.render("");
});

router.post("/admin-logout", function (req, res) {
    req.session.admin_login = false;
    res.render("");
});

module.exports = router;
