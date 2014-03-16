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


            var data={
                'id':profile.id,
                'nickname':profile.screen_name,
                'name':profile.name,
                'gender':profile.gender=='m'?'男':'女',
                'location':profile.location,
                'avtar':profile.profile_image_url
            };

            User.findOrCreate({'authOrigin':'sina','sina':data}, function (err, user) {
                return done(err, user);
            });
        }
    ));


    passport.use(new qqStrategy({
            clientID: config.qq.clientID,
            clientSecret: config.qq.clientSecret,
            callbackURL: config.qq.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {

            if (profile.ret>=0){

                var data={
                    'id':profile.id,
                    'nickname':profile.nickname,
                    'gender':profile.gender,
                    'avtar':profile.figureurl_qq_1
                }
                User.findOrCreate({'authOrigin':'qq',qq:data}, function (err, user) {
                    return done(err, user);
                });
            }


        }
    ));
}
