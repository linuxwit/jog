var Post = require('../models/post');
var User = require('../models/user');
var Auth = require('../middlewares/auth');
var moment = require('moment');
var crypto = require('crypto');

var log4js = require('log4js');
//log4js.configure('log4js.json',{});
var logger = log4js.getLogger();

module.exports = function(app, passport) {


    app.get('/', function(req, res) {

        moment.lang('zh-cn');

        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.find({}, {}, {
            skip: page * 12,
            limit: 12
        }).where('status').sort({
            posted: 'desc'
        });

        query.exec(function(err, docs) {
            user = req.isAuthenticated() ? req.user : null;
            res.render('index', {
                posts: docs,
                moment: moment,
                page: page,
                qiniu_host: 'http://lovejog.qiniudn.com',
                user: user
            });
        })
    })

    app.get('/post/:id', function(req, res) {

        /*  if (!req.isAuthenticated()) {
         res.redirect('/login');
         }*/
        moment.lang('zh-cn');

        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.findOne({
            '_id': req.params.id
        });
        query.exec(function(err, doc) {
            user = req.isAuthenticated() ? req.user : null;
            res.render('post', {
                post: doc,
                moment: moment,
                page: page,
                qiniu_host: 'http://lovejog.qiniudn.com',
                user: user
            });
        })
    })


    app.get('/signin', function(req, res) {
        res.render('signin', {
            user: req.user,
            returnUrl:req.param('return','/')
        });
    })

    app.post('/signin', function(req, res) {
        passport.authenticate('local', function(err, user) {
            if (!user) {
                return res.render("signin", {
                    msg: '邮箱或密码不正确!',
                    user: req.user
                });
            };
            req.login(user, function(err) {
                if (err) return next(err);
                 console.log(req.param('return'));
                res.redirect(req.param('return','/'));
            });
        })(req, res);
    });



    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get("/signup", function(req, res) {
        res.render("signup", {
            msg: '',
            user: req.user,
            returnUrl:req.param('return','/')
        });
    });



    app.get("/bind/:id", function(req, res) {
        res.render("weixin/bind", {
            id: req.params.id,
            msg: '',
            user: req.user
        });
    })

    app.post("/bind/:id", function(req, res, next) {

        var open_id = req.params.id;
        User.findOne({
            email: req.body.email
        }, function(err, _user) {
            if (!_user) {
                //新用户注册并绑定微信
                User.signup(req.params.id, req.body.email, req.body.password, function(err, user) {
                    if (err)
                        throw err;
                    req.login(user, function(err) {
                        if (err) return next(err);
                        return res.redirect("/setting/group");
                    });
                });
            } else {
                //老用户验证后绑定微信
                passport.authenticate('local', function(err, user) {
                    if (!user) {
                        return res.render("weixin/bind", {
                            id: open_id,
                            msg: '密码不正确!',
                            user: req.user
                        });
                    };
                    user.wx_openid = open_id;
                    user.save(function(err, doc) {
                        if (err) {
                            console.log('bind error' + err);
                            return res.render("weixin/bind", {
                                id: req.params.id,
                                msg: '',
                                user: req.user
                            });
                        }
                        console.log(doc.wx_openid);
                        req.login(doc, function(err) {
                            if (err) return next(err);
                            return res.redirect("/setting/group");
                        });
                    });
                })(req, res);
            }
        });
    });

    app.post("/signup", Auth.userExist, function(req, res, next) {
        User.signup(null, req.body.email, req.body.password, function(err, user) {
            if (err)
                throw err;
            req.login(user, function(err) {
                if (err)
                    return next(err);
                return res.redirect("/");
            });
        });
    });

    app.get('/edit/:openid/:id', function(req, res, next) {

        User.findOne({
            'wx_openid': req.params.openid
        }, function(err, user) {
            var query = Post.findOne({
                '_id': req.params.id
            });
            query.exec(function(err, doc) {
                if (doc) {
                    res.render('weixin/edit', {
                        post: doc,
                        openid: req.params.openid,
                        id: req.params.id,
                        user: user
                    });
                }
            })
        });
    });



    app.get('/getpassword', function(req, res) {
        res.render('getpassword');
    })

    app.post('/getpassword', function(req, res) {
        //TODO send mail
        res.render('getpassword', {
            status: 1,
            msg: '已经发送邮件成功'
        });
    })


    app.get('/auth/qq',
        passport.authenticate('qq'),
        function(req, res) {
            // The request will be redirected to qq for authentication, so this
            // function will not be called.
        }
    );

    app.get('/auth/qq/callback', passport.authenticate('qq', {
        failureRedirect: '/login'
    }), function(req, res) {
        res.redirect('/');
    });


    app.get('/auth/weibo', function(req, res, next) {
        req.session = req.session || {};
        req.session.auth_state = crypto.createHash('sha1').update(-(new Date()) + '').digest('hex');
        passport.authenticate('sina', {
            'state': req.session.auth_state
        })(req, res, next)
    }, function(req, res) {
        // The request will be redirected to qq for authentication, so this
        // function will not be called.
    });

    app.get('/auth/weibo/callback', function(req, res, next) {
        if (req.session && req.session.auth_state && req.session.auth_state === req.query.state) {
            passport.authenticate('sina', {
                failureRedirect: '/login'
            })(req, res, next);
        } else {
            next(new Error('Auth State Mismatch'));
        }
    }, function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

    //用户设置
    app.get('/user/profile', Auth.isAuthenticated, function(req, res) {
        console.log(req.user);
        res.render('profile', {
            user: req.user
        });
    })



}