const Router = require("express").Router;
const router = new Router();
var gapi = require("../gapi");

const googleapis = require("googleapis");
const plus = googleapis.plus("v1");

var db = require("../db");

const adminRoutes = require("./admin");
router.use("/admin", adminRoutes);

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

router.post("/logout", function (req, res) {
    res.render("");
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

router.post("/admin-logout", function (req, res) {
    req.session.admin_login = false;
    res.render("");
});

module.exports = router;
