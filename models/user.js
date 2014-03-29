var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema=mongoose.Schema;
var Post = require('./post');

var hash = require('../util/hash');

UserSchema = mongoose.Schema({
	nickname:  String,
	gender:   String,
	email:      String,
	salt:       String,
	hash:       String,
    authOrigin:   String,
    avatar:String,
    wx_openid:String,
	qq:{
        id:       String,
        nickname:String,
        name:String,
        gender:String,
        avatar:String
	},
	sina:{
		id:       String,
        nickname:String,
        name:String,
        gender:String,
        location:String,
        avatar:String
	}
});


UserSchema.statics.signup = function(wx_openid,email, password, done){
	var user = this;
	hash(password, function(err, salt, hash){
		if (err) return done(err);
		User.create({
            wx_openid:wx_openid,
			email : email,
			salt : salt,
			hash : hash
		}, function(err, user){
            if (err) return done(err);
			done(null, user);
		});
	});
}

UserSchema.statics.findUserByOpenId=function(wx_open_id,done){
    this.findOne({wx_openid : wx_open_id}, function(err, user){
        if (err)
            done(err);
        done(null, user);
    })
}

UserSchema.statics.isValidUserPassword = function(email, password, done) {
	this.findOne({email : email}, function(err, user){
		if(err) return done(err);
		if(!user) return done(null, false, { message : '帐号不存在.' });
		hash(password, user.salt, function(err, hash){
			if(err) return done(err);
			if(hash == user.hash) return done(null, user);
			done(null, false, {
				message : '密码有误，请重新输入.'
			});
		});
	});
};

UserSchema.statics.findOrCreate=function(profile,done){
    var User = this;
    var query = {};
    query[profile.authOrigin + '.id'] = profile[''+profile.authOrigin].id;
    User.findOne(query, function(err, user){
        if(err) return done(err);
        if(user){

            console.log('update the user');
            user[''+profile.authOrigin] = profile[''+profile.authOrigin];

            user.save(function(err, user){
                if(err) throw err;
                done(null, user);
            });
        } else {

            user={
                nickname:profile[''+profile.authOrigin].nickname,
                avatar:profile[''+profile.authOrigin].avatar,
                authOrigin:profile.authOrigin
            }
            user[''+profile.authOrigin] = profile[''+profile.authOrigin];
            console.log(user);
            User.create(user,function(err, user){
                    console.log('save user ................');
                    console.dir(user);
                    if(err) throw err;
                    done(null, user);
                }
            );
        }
    })
}

// Create a new user given a profile
UserSchema.statics.findOrCreateOAuthUser = function(profile, done){
	var User = this;

	// Build dynamic key query
	var query = {};
	query[profile.authOrigin + '.id'] = profile.id;

	// Search for a profile from the given auth origin
	User.findOne(query, function(err, user){
        if(err) return done(err);

		// If a user is returned, load the given user
		if(user){
			done(null, user);
		} else {
			// Otherwise, store user, or update information for same e-mail
			User.findOne({ 'email' : profile.emails[0].value }, function(err, user){
				if(err) throw err;

				if(user){
					// Preexistent e-mail, update
					user[''+profile.authOrigin] = {};
					user[''+profile.authOrigin].id = profile.id;
					user[''+profile.authOrigin].email = profile.emails[0].value;
					user[''+profile.authOrigin].name = profile.displayName;

					user.save(function(err, user){
						if(err) throw err;
						done(null, user);
					});
				} else {
					// New e-mail, create
					
					// Fixed fields
					user = {
						email : profile.emails[0].value,
						firstName : profile.displayName.split(" ")[0],
						lastName : profile.displayName.replace(profile.displayName.split(" ")[0] + " ", "")
					};

					// Dynamic fields
					user[''+profile.authOrigin] = {};
					user[''+profile.authOrigin].id = profile.id;
					user[''+profile.authOrigin].email = profile.emails[0].value;
					user[''+profile.authOrigin].name = profile.displayName;

					User.create(
						user,
						function(err, user){
							if(err) throw err;
							done(null, user);
						}
					);
				}
			});
		}
	});
}

var User = restful.model("User", UserSchema).methods(['get', 'put','post']);

module.exports = User;