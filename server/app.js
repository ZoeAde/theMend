// *** main dependencies *** //
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../oauth.js');
var mongoose = require('mongoose');
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;

// *** routes *** //
var routes = require('/routes/index.js');

// serialize and deserialize
passport.serializeUser(function(user, done) {
done(null, user);
});
passport.deserializeUser(function(obj, done) {
done(null, obj);
});

// config
passport.use(new InstagramStrategy({
 clientID: config.instagram.clientID,
 clientSecret: config.instagram.clientSecret,
 callbackURL: config.instagram.callbackURL
},
function(accessToken, refreshToken, profile, done) {
 process.nextTick(function () {
   return done(null, profile);
 });
}
));


// *** express instance *** //
var app = express();

// *** static directory *** //
app.set('views', path.join(__dirname, 'views'));


// *** config middleware *** //
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());

// *** main routes *** //
app.use('/', routes);

app.get('/account', ensureAuthenticated, function(req, res){
res.render('account', { user: req.user });
});

app.get('/auth/instagram',
passport.authenticate('instagram'),
function(req, res){
});
app.get('/auth/instagram/callback',
passport.authenticate('instagram', { failureRedirect: '/' }),
function(req, res) {
 res.redirect('/account');
});

app.get('/logout', function(req, res){
req.logout();
res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// *** error handlers *** //

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// test authentication
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.redirect('/');
}

module.exports = app;
