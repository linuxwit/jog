var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , SinaStrategy = require('passport-sina').Strategy
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

    passport.use(new SinaStrategy({
            clientID: config.sina.clientID,
            clientSecret: config.sina.clientSecret,
            callbackURL: config.sina.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {

            console.dir(profile);

            /*
            User.findOrCreate({ singId: profile.id }, function (err, user) {
                return done(err, user);
            });
            */
        }
    ));


    passport.use(new qqStrategy({
            clientID: config.qq.clientID,
            clientSecret: config.qq.clientSecret,
            callbackURL: config.qq.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile);
            /*
            User.findOrCreate({ qqId: profile.id }, function (err, user) {
                return done(err, user);
            });*/
        }
    ));
}
