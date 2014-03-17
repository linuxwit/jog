var Post = require('../models/post');
var User = require('../models/user');
var Auth = require('../middlewares/auth');
var moment = require('moment');
var crypto = require('crypto');
module.exports = function (app, passport) {


    app.get('/', function (req, res) {

        if (!req.isAuthenticated()) {
            res.redirect('/signin');
        }
        moment.lang('zh-cn');

        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.find({}, {}, { skip: page * 12, limit: 12 }).sort({ posted: 'desc' });
        query.exec(function (err, docs) {


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

    app.get('/post/:id',function(req,res){
        if (!req.isAuthenticated()) {
            res.redirect('/login');
        }
        moment.lang('zh-cn');

        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.findOne({'_id':req.params.id});
        query.exec(function (err, doc) {
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

    app.get('/login', function (req, res) {
        res.render('login');
    })

    app.get('/signin', function (req, res) {
        res.render('signin');
    })

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/signin');
    });

    app.post("/login"
        , passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: "/login"
        })
    );

    app.get("/signup", function (req, res) {
        res.render("signup", {msg: ''});
    });


    app.post("/signin"
        , passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: "/signin"
        })
    );

    app.post("/signup", Auth.userExist, function (req, res, next) {
        User.signup(req.body.email, req.body.password, function (err, user) {
            if (err) throw err;
            req.login(user, function (err) {
                if (err) return next(err);

                return res.redirect("/login");
            });
        });
    });

    app.get('/getpassword', function (req, res) {
        res.render('getpassword');
    })

    app.post('/getpassword',function(req,res){
        //TODO send mail
        res.render('getpassword',{status:1,msg:'已经发送邮件成功'});
    })


    app.get('/auth/qq',
        passport.authenticate('qq'),
        function(req, res){
            // The request will be redirected to qq for authentication, so this
            // function will not be called.
        }
    );

    app.get('/auth/qq/callback', passport.authenticate('qq', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
    );


    app.get('/auth/weibo',
        function(req, res, next) {
            req.session = req.session || {};
            req.session.auth_state = crypto.createHash('sha1').update(-(new Date()) + '').digest('hex');
            passport.authenticate('sina', { 'state': req.session.auth_state })(req, res, next)
        },
        function(req, res){
            // The request will be redirected to qq for authentication, so this
            // function will not be called.
        }
    );

    app.get('/auth/weibo/callback',
        function(req, res, next){
            if(req.session && req.session.auth_state && req.session.auth_state === req.query.state) {
                passport.authenticate('sina', { failureRedirect: '/login' })(req, res, next);
            } else {
                next(new Error('Auth State Mismatch'));
            }
        },
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');


        }
    );

}