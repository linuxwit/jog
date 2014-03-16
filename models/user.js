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
    third_id:   String,
    wx_status:String,
	qq:{
		id:       String,
		email:    String,
		name:     String
	},
	weibo:{
		id:       String,
		email:    String,
		name:     String
	}
});


UserSchema.statics.signup = function(email, password, done){
	var user = this;
	hash(password, function(err, salt, hash){
		if (err) return done(err);
		User.create({
			email : email,
			salt : salt,
			hash : hash
		}, function(err, user){
            if (err) return done(err);
			done(null, user);
		});
	});
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
    query[profile.authOrigin + '.id'] = profile.id;

    console.log('findOrCreate');
    console.log(profile);
    console.log('query the user ');
    User.findOne(query, function(err, user){
        if(err) return done(err);

        console.log('end query the user ');
        if(user){
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

            console.log('create user');
            User.create(user,function(err, user){
                    console.log('save user ................');
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