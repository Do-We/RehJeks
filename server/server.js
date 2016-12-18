var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var stub = require('./utils/databaseStub');
var routes = require('./utils/routes.js');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//deployed DB at mongodb://heroku_rhmw8v8m:ugiqvmqosj3ed5et4c2o3hh0or@ds127938.mlab.com:27938/heroku_rhmw8v8m

// For deployment purposes, the db is selected by environmental variables if available.
// Otherwise we use the local db address.
// var localDb = 'mongodb://127.0.0.1:27017/rehjeks';
var localDb = 'mongodb://elliott:e@ds133378.mlab.com:33378/rehjeks_test';
var currentDb = process.env.MONGODB_URI || localDb;
console.log('currentDb is __', currentDb);

// Same as the port.
var PORT = process.env.PORT || 8000;

var db = mongoose.connect(currentDb);


var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//passport config
var User = require('./utils/users/userModel');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

routes(app, express);

app.use(express.static(__dirname + './../client'));

app.listen(PORT, function() {
  console.log('Listening on ', PORT);
});
 