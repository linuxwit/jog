var restful = require('node-restful');
var mongoose = restful.mongoose;
var User = require('../models/user');
var Auth = require('../middlewares/auth');
var moment = require('moment');
var Post = require('../models/post');
var JogGroup = require('../models/joggroup');
var restful = require('node-restful');
var Group = require('../middlewares/group');
/**
 * Model
.where('age').gte(25)
.where('tags').in(['movie', 'music', 'art'])
.select('name', 'age', 'tags')
.skip(20)
.limit(10)
.asc('age')
.slaveOk()
.hint({ age: 1, name: 1 })
.exec(callback);
 * @param  {[type]} app      [description]
 * @param  {[type]} passport [description]
 * @return {[type]}          [description]
 */
module.exports = function(app, passport) {

	//选择微信群
	app.get('/setting/group', Auth.isAuthenticated, function(req, res) {
		var query = JogGroup.find({});
		query.exec(function(err, docs) {
			if (docs) {
				console.log(docs);
				res.render('setting/group', {
					groups: docs,
					user: req.user
				});
			}
		})
	});

	//申请加入群
	app.post('/join/group/:id', Auth.isAuthenticated, function(req, res) {
		Group.join(req, res, function(success, err, _user) {
			if (success) {
				console.log('加入成功');
				return res.redirect('/user/group'); //我加入的小组
			}
			res.render('setting/group', {
				groups: docs,
				user: req.user,
				msg: err
			});
		});
	});


	app.get('/user/group', Auth.isAuthenticated, function(req, res) {

		User.findOne({
			_id: req.user._id
		}, function(err, _user) {
			JogGroup
				.where('_id').in(_user.join_groups)
				.slaveOk()
				.exec(function(err,docs) {
					console.log(docs);
					res.render('user/group', {
						groups: docs,
						user: req.user
					});
				});
		});

	});

   app.get('/daka', function(req, res) {
        moment.lang('zh-cn');
        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.find({category:'daka'}, {}, {
            skip: page * 6,
            limit: 6
        }).where('status').sort({
            posted: 'desc'
        });

        query.exec(function(err, docs) {
            user = req.isAuthenticated() ? req.user : null;
            res.render('daka', {
                posts: docs,
                moment: moment,
                page: page,
                qiniu_host: 'http://lovejog.qiniudn.com',
                user: user,
                action:'daka'
            });
        })
    })


};