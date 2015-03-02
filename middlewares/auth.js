var User = require('../models/user');

exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
};

exports.userExist = function(req, res, next) {
    User.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            //res.redirect("/signup");
            res.render('signup',{msg:'邮箱已经注册过了呢！'})
        }
    });
};