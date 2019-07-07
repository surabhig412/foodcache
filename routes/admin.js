const Router = require("express").Router;
const router = new Router();

const { Admin, FoodItem, Foodie, FoodStock } = require("../models");

router.post("/login", async function (req, res) {
    try {
        if (!await Admin.isAdmin(req.body.username, req.body.password)) {
            res.redirect("/");
            return;
        }

        req.session.admin_login = true;
        res.redirect("/admin/details");
    } catch (err) {
        console.error(err);
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
        const foodiesResult = await Foodie.findAll();
        const foodItems = await FoodItem.findAll();
        const foodstock = await FoodStock.findAll();
        const admin = await Admin.findOne({ attributes: [ "amount_received" ] });

        res.render("admin-details.jade", { foodies: foodiesResult, fooditems: foodItems, foodstock: foodstock, admin: admin });
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

router.post("/users/details/update", async function (req, res) {
    try {
        const admin = await Admin.findOne();
        admin.increment("amount_received", { by: req.body.amount });

        const foodie = await Foodie.findOne({ where: { serial_no: req.body.serial_no } });
        await foodie.paymentReceived();

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

router.post("/users/details/edit", async function (req, res) {
    try {
        await Foodie.update({ amount_due: req.body.amount }, { where: { serial_no: req.body.serial_no } });

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

router.post("/users/notify", async function (req, res) {
    try {
        await Foodie.notifyAllPaymentDue();

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

router.post("/items/purchase", async function (req, res) {
    try {
        var fooditem = { items: req.body.items, description: req.body.description, amount: req.body.amount };
        FoodItem.create(fooditem);

        const admin = await Admin.findOne();
        admin.decrement("amount_received", { by: fooditem.amount });

        await Foodie.notifyAllAboutPurchase(req.body.items);

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    };
});

router.post("/foodstock/add", async function (req, res) {
    try {
        const foodstockItem = { fooditem: req.body.fooditem };
        await FoodStock.create(foodstockItem);

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    };
});

router.post("/foodstock/delete", async function (req, res) {
    try {
        const itemID = { id: req.body.id };
        await FoodStock.destroy({ where: itemID });

        res.render("");
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

module.exports = router;
