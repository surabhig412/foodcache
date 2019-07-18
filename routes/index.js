const Router = require("express").Router;
const router = new Router();
var gapi = require("../gapi");

const googleapis = require("googleapis");
const plus = googleapis.plus("v1");

const { Foodie } = require("../models");

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
            console.error(err);
            res.send(err);
        }
        gapi.client.credentials = tokens;
        plus.people.get({
            userId: "me",
            auth: gapi.client,
        }, async function (err, response) {
            if (err) {
                console.error(err);
                res.send(err);
            } else {
                try {
                    const [foodie] = await Foodie.findOrCreate({
                        raw: true,
                        where: { email: response.emails[0].value },
                        defaults: { id: response.id, full_name: response.displayName, image_url: response.image.url, email: response.emails[0].value, amount_due: 0 },
                    });

                    res.render("profile.jade", foodie);
                } catch (err) {
                    console.error(err);
                    res.send(err);
                }
            }
        });
    });
});

router.post("/logout", function (req, res) {
    res.render("");
});

module.exports = router;
