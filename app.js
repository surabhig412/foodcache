var app = require('express')();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({'extended':'true'}));
app.set("view engine","jade");
var db = require('./db');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/redirect', function(req, res) {
  db.query("select * from foodies where email = ?", req.body.email, function(err, result) {
    if(err) res.send(err);
    var foodie = {id: req.body.id, full_name: req.body.full_name, given_name: req.body.given_name, family_name: req.body.family_name, image_url: req.body.image_url, email: req.body.email};
    if(result.length === 0) {
      db.query("insert into foodies set ?", foodie, function(err, result) {
        if(err) res.send(err);
      });
    }
    res.render('profile', foodie);
  });
});
console.log("server started at port 8071");
app.listen(8071)
