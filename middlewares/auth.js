var User = require('../models/user');
var mail = require('./mail');
exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin?return="+req.url);
    }
};

exports.userExist = function(req, res, next) {
    User.count({
        email: req.body.email
    }, function(err, count) {
        if (count === 0) {
            next();
        } else {
            //res.redirect("/signup");
            res.render('signup', {
                msg: '邮箱已经注册过了呢！'
            });
        }
    });
};

exports.createCode = function(req, res,next) {
    User.findOne({
        email: req.body.email
    }, function(err, _doc) {
        if (err) {
            return next(err);
        }

        if (!_doc) {
            res.render('getpassword', {
                msg: '邮箱不存在'
            });
        } else {
            var code = {
                text: Match.round(100000, 999999),
                time: Date.Now()
            };

            User.update({
                _id: _doc._id
            }, {
                code: code
            }, function(err, _doc) {
                if (_doc) {
                    mail.send('找回密码', '你的邮箱验证码为：' + code.text + ',30分钟内有效', 'support@lovejog.com', req.body.email);
                }
            });
        }
    });
};