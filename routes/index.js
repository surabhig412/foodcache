const Router = require("express").Router;
var gapi = require("../gapi");

const googleapis = require("googleapis");
const plus = googleapis.plus("v1");

var db = require("../db");
var models = require("../models");

var apiKey = process.env.mailgun_key;
var domain = process.env.mailgun_domain;
var mailgun = require("mailgun-js")({ apiKey: apiKey, domain: domain, });
var slack = require("../slack");

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
        db.query("select * from fooditems", function (err, result) {
            if (err) res.send(err);
            fooditemsResult = JSON.stringify(result);
        });
        models.FoodStock.findAll()
            .then(foodstock => {
                foodstockResult = JSON.stringify(foodstock);
            })
            .then(() => {
                db.query("select amount_received from admin", function (err, result) {
                    if (err) res.send(err);
                    var adminResult = JSON.stringify(result);
                    res.render("admin-details.jade", { foodies: JSON.parse(foodiesResult), admin_details: JSON.parse(adminResult), fooditems: JSON.parse(fooditemsResult), foodstock: JSON.parse(foodstockResult), });
                });
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
            var message = "Received payment of Rs. " + req.body.amount;
            var data = {
                from: "Foodcache <donotreply@foodcache.com>",
                to: result[0].email,
                subject: "Received payment",
                text: message,
            };
            mailgun.messages().send(data, function (error, body) {
                console.log(error);
            });

            const channelID = result[0].channel;
            slack.chat.postMessage({ channel: channelID, text: message, })
                .then((res) => {
                    console.log("Message sent: ", res);
                })
                .catch(console.error);
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
            for (var index in result) {
                if (result[index].amount_due !== 0) {
                    var message = "Please pay your dues for this month. Your total due amount is Rs. " + result[index].amount_due;
                    var data = {
                        from: "Foodcache <donotreply@foodcache.com>",
                        to: result[index].email,
                        subject: "Gentle reminder to pay monthly dues.",
                        text: message,
                    };

                    mailgun.messages().send(data, function (error, body) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(body);
                        }
                    });

                    const channelID = result[index].channel;
                    slack.chat.postMessage({ channel: channelID, text: message, })
                        .then((res) => {
                            console.log("Message sent: ", res);
                        })
                        .catch(console.error);
                }
            }
            res.render("");
        });
    }
});

function formatItems (items) {
    var lastCommaIndex = items.lastIndexOf(",");
    if (lastCommaIndex !== -1) {
        items = "are " + items.substr(0, lastCommaIndex) + " and " + items.substr(lastCommaIndex + 1, items.length);
        return items.toLowerCase();
    } else {
        return "is " + items.toLowerCase();
    }
}

router.post("/admin/items/purchase", function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        var fooditem = { amount: req.body.amount, description: req.body.description, items: req.body.items, };
        db.query("insert into fooditems set ?", fooditem, function (err, result) {
            if (err) res.send(err);
        });
        db.query("update admin set amount_received = amount_received - ?", fooditem.amount, function (err, result) {
            if (err) res.send(err);
        });
        db.query("select * from foodies", function (err, result) {
            if (err) res.send(err);
            for (var email in result) {
                var message = "Food items purchased " + formatItems(req.body.items) + ". Come and check.";
                var data = {
                    from: "Foodcache <donotreply@foodcache.com>",
                    to: result[email].email,
                    subject: "New food items purchased",
                    text: message,
                };
                mailgun.messages().send(data, function (error, body) {
                    console.log(error);
                });

                const channelID = result[email].channel;
                slack.chat.postMessage({ channel: channelID, text: message, })
                    .then((res) => {
                        console.log("Message sent: ", res);
                    })
                    .catch(console.error);
            }
            res.render("");
        });
    }
});

router.post("/admin/foodstock/add", async function (req, res) {
    if (checkAdminLoggedIn(req, res)) {
        const foodstockItem = { fooditem: req.body.fooditem, };

        models.FoodStock.create(foodstockItem)
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

        models.FoodStock.destroy({ where: itemID, })
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
