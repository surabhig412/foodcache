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
var api_key = process.env.mailgun_key;
var domain = process.env.mailgun_domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

app.use(cookieParser());
app.use(session({secret: "secret"}));
app.use(bodyParser.urlencoded({'extended':'true'}));

app.get('/', function(req, res) {
  var locals = {
        title: 'FoodCache',
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
        } else {
          foodie["amount_due"] = result[0].amount_due;
        }
        res.render('profile.jade', foodie);
      });
    });
  });
});

app.post('/admin-login', function(req, res) {
  db.query("select * from admin", function(err, result) {
    if(err) res.send(err);
    if(result[0].username !== req.body.username || result[0].password !== req.body.password) {
      res.redirect('/');
      return;
    }
    req.session.admin_login = true;
    res.redirect('/admin/details');
  });
});

app.get('/admin/details', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    var foodies_result, fooditems_result;
    db.query("select * from foodies", function(err, result) {
      if(err) res.send(err);
      foodies_result = JSON.stringify(result);
    });
    db.query("select * from fooditems", function(err, result) {
      if(err) res.send(err);
      fooditems_result = JSON.stringify(result);
    });
    db.query("select amount_received from admin", function(err, result) {
      if(err) res.send(err);
      var admin_result = JSON.stringify(result);
      res.render('admin-details.jade', {foodies: JSON.parse(foodies_result), admin_details: JSON.parse(admin_result), fooditems: JSON.parse(fooditems_result)});
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

app.post('/admin/users/details/edit', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    db.query("update foodies set amount_due = ? where serial_no = ?", [req.body.amount, req.body.serial_no], function(err, result) {
      if(err) {
        res.send(err);
      }
      res.render('');
    });
  }
});

app.post('/admin/items/purchase', function(req, res) {
  if(checkAdminLoggedIn(req, res)) {
    var fooditem = {amount: req.body.amount, description: req.body.description, items: req.body.items}
    db.query("insert into fooditems set ?", fooditem, function(err, result) {
      if(err) res.send(err);
    });
    db.query("update admin set amount_received = amount_received - ?", fooditem.amount, function(err, result) {
      if(err) res.send(err);
    });
    db.query("select email from foodies", function(err, result) {
      if(err) res.send(err);
      for(var email in result) {
        console.log("Email " + result[email].email);
        var data = {
          from: 'Foodcache <donotreply@foodcache.com>',
          to: result[email].email,
          subject: 'New food items purchased',
          text: 'Food items purchased. Come and check.'
        };
        mailgun.messages().send(data, function (error, body) {
          console.log(error);
        });
      }
      res.render('');
    });
  }
});

var checkAdminLoggedIn = function(req, res) {
  if(req.session.admin_login === undefined || req.session.admin_login === false) {
    res.redirect('/');
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

console.log("server started at port 3000");
app.listen(3000)
