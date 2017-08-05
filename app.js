var app = require('express')();
var path = require('path');
var bodyParser = require('body-parser');
app.set("view engine","jade");
var db = require('./db');
var schedule = require('./scheduler');
var gapi = require('./gapi');
var googleapis = require('googleapis');
var plus = googleapis.plus('v1');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret: "secret"}));
app.use(bodyParser.urlencoded({'extended':'true'}));

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
        var foodie = {id: response.id, full_name: response.displayName, image_url: response.image.url, email: response.emails[0].value, amount_due: 0};
        if(result.length === 0) {
          db.query("insert into foodies set ?", foodie, function(err, result) {
            if(err) res.send(err);
          });
        }
        res.render('profile.jade', foodie);
      });
    });
  });
});

app.get('/admin', function(req, res) {
  res.render('admin.jade');
});

app.post('/admin-login', function(req, res) {
  db.query("select * from admin", function(err, result) {
    if(err) res.send(err);
    if(result[0].username !== req.body.username || result[0].password !== req.body.password) {
      res.redirect('/admin');
      return;
    }
    req.session.admin_login = true;
    res.redirect('/admin/details');
  });
});

app.get('/admin/details', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    var foodies_result;
    db.query("select * from foodies", function(err, result) {
      if(err) res.send(err);
      foodies_result = JSON.stringify(result);
    });
    db.query("select amount_received from admin", function(err, result) {
      if(err) res.send(err);
      var admin_result = JSON.stringify(result);
      res.render('admin-details.jade', {foodies: JSON.parse(foodies_result), admin_details: JSON.parse(admin_result)});
    });
  }
});

app.post('/admin/users/details/update', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    db.query("update admin set amount_received = amount_received + ?", req.body.amount, function(err, result) {
      if(err) res.send(err);
    });
    db.query("update foodies set amount_due = 0 where serial_no = ?", req.body.serial_no, function(err, result) {
      if(err) res.send(err);
      res.render('');
    });
  }
});

app.post('/admin/amount/update', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    db.query("update admin set amount_received = amount_received - ?", req.body.amount, function(err, result) {
      if(err) res.send(err);
      res.render('');
    });
  }
});

var checkAdminLoggedIn = function(req, res) {
  if(req.session.admin_login === undefined || req.session.admin_login === false) {
    res.redirect('/admin');
    return false;
  }
  return true;
}

app.post('/logout', function(req, res) {
  res.render('');
});

app.post('/admin-logout', function(req, res) {
  req.session.admin_login = false;
  res.render('');
});

console.log("server started at port 8071");
app.listen(8071)
