var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , SinaStrategy = require('passport-sina').OAuth2Strategy
  , qqStrategy = require('passport-qq').Strategy
  , User = require('../models/user');


module.exports = function (passport, config) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findOne({ _id: id }, function (err, user) {
			done(err, user);
		});
	});


  	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
    },
    function(email, password, done) {
    	User.isValidUserPassword(email, password, done);
    }));


    /*passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
    	profile.authOrigin = 'facebook';
    	User.findOrCreateOAuthUser(profile, function (err, user) {
	      return done(err, user);
	    });
    }));

	passport.use(new GoogleStrategy({
	    clientID: config.google.clientID,
	    clientSecret: config.google.clientSecret,
	    callbackURL: config.google.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	profile.authOrigin = 'google';
	    User.findOrCreateOAuthUser(profile, function (err, user) {
	      return done(err, user);
	    });
	  }
	));*/

    passport.use(new SinaStrategy({
            clientID: client_id,
            clientSecret: client_secret,
            callbackURL: "http://127.0.0.1:8080/auth/sina/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOrCreate({ singId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }
    ));


    passport.use(new qqStrategy({
            clientID: client_id,
            clientSecret: client_secret,
            callbackURL: "http://127.0.0.1:8080/auth/qq/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOrCreate({ qqId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }
    ));
}
