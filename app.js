var app = require('express')();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({'extended':'true'}));
app.set("view engine","jade");
var db = require('./db');
var schedule = require('./scheduler');
var gapi = require('./gapi');
var googleapis = require('googleapis');
var plus = googleapis.plus('v1');

app.get('/', function(req, res) {
  var locals = {
        title: 'Best Before',
        url: gapi.url
      };
  res.render('index.jade', locals);
});

app.get('/redirect', function(req, res) {
  var code = req.query.code;
  gapi.client.getToken(code, function(err, tokens){
    gapi.client.credentials = tokens;
    plus.people.get({
      userId: 'me',
      auth: gapi.client
    }, function (err, response) {
      db.query("select * from foodies where email = ?", response.emails[0].value, function(err, result) {
        if(err) res.send(err);
        var foodie = {id: response.id, full_name: response.displayName, image_url: response.image.url, email: response.emails[0].value};
        if(result.length === 0) {
          db.query("insert into foodies set ?", foodie, function(err, result) {
            if(err) res.send(err);
          });
        }
        res.render('profile', foodie);
      });
    });
  });
});

app.get('/logout', function(req, res) {
  console.log("logout called");
  res.redirect('/');
});

console.log("server started at port 8071");
app.listen(8071)
