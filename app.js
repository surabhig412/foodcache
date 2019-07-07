require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Database = require("./database");
const apiRoutes = require("./routes");

const app = express();

app.set("view engine", "jade");
app.set("port", process.env.PORT || 3000);

app.use(logger("short"));
app.use(cookieParser());
app.use(session({ secret: "secret" }));
app.use(bodyParser.urlencoded({ "extended": "true" }));
app.use(cors());
app.use(helmet());

const database = new Database();

app.use("/", apiRoutes);

app.use((req, res) => {
    res.status(404).send("Sorry not found! 404!");
});

app.use((req, res) => {
    res.status(500).send("Sorry! Something broke!");
});

app.listen(app.get("port"));
console.log(`App listening on ${app.get("port")}`);
