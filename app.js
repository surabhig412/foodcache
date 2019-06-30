require("dotenv").config();

var app = require("express")();
var bodyParser = require("body-parser");
app.set("view engine", "jade");
var cookieParser = require("cookie-parser");
var session = require("express-session");

app.use(cookieParser());
app.use(session({ secret: "secret", }));
app.use(bodyParser.urlencoded({ "extended": "true", }));

const apiRoutes = require("./routes");
app.use("/", apiRoutes);

app.listen(3000);
