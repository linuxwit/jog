var Post = require('../models/post');
var User = require('../models/user');
var Auth = require('../middlewares/auth');
var moment = require('moment');
module.exports = function (app, passport) {


    app.get('/', function (req, res) {

        if (!req.isAuthenticated()) {
            res.redirect('/login');
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

    app.get('/login', function (req, res) {
        res.render('login');
    })

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
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
        });

    app.get('/auth/qq/callback',
        passport.authenticate('qq', { failureRedirect: '/login' }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

}