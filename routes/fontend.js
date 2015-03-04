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
				res.render('setting/group', {
					groups: docs,
					user: req.user
				});
			}
		});
	});

	//申请加入群
	app.post('/join/group/:id', Auth.isAuthenticated, function(req, res) {
		Group.join(req, res, function(success, err, _user) {
			if (success) {
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
				.exec(function(err, docs) {
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
		var query = Post.find({
			category: 'daka'
		}, {}, {
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
				action: 'daka'
			});
		})
	});

 
  app.get('/wenda', function(req, res) {
        moment.lang('zh-cn');
        var page = req.param("page") ? parseInt(req.param("page")) : 0;
        var query = Post.find({category:'wenda'}, {}, {
            skip: page * 12,
            limit: 12
        }).where('status').sort({
            posted: 'desc'
        });

        query.exec(function(err, docs) {
            user = req.isAuthenticated() ? req.user : null;
            res.render('wenda', {
                posts: docs,
                moment: moment,
                page: page,
                qiniu_host: app.get('qiniu'),
                user: user,
                action:'wenda'
            });
        });
    });

	app.get('/wx/post/:id', Auth.isAuthenticated, function(req, res, next) {
		console.log(req.params.id);
		var query = Post.findOne({
			'_id': req.params.id
		});

		query.exec(function(err, doc) {
			console.log(err);
			if (!doc) {
				return res.redirect('/');
			}
			if (doc.author == req.user._id) {
				return res.render('weixin/post', {
					post: doc,
					openid: req.params.openid,
					id: req.params.id,
					user: req.user
				});
			} else {
				console.log(doc.author);
				console.log(req.user._id);
			}
		})
	});

	app.post('/edit/:id', function(req, res) {
		Post.findOne({
			'_id': req.params.id,
			'author': req.user._id
		}, function(err, post) {
			if (err || !post) {
				return res.redirect('/');
			}

			if (req.body.action == 'save') {
				if (post.category !== 'wenda') {
					post.number = req.body.number;
					post.length = req.body.length;
					post.costtime = req.body.costtime;
					post.category = req.body.category;
				}
				post.content = req.body.content;
				post.save(function(err, post) {
					console.log(post);
					if (post.category == 'daka') {
						res.redirect('/daka/' + post._id);
					} else if (post.category == 'wenda') {
						res.redirect('/wenda/' + post._id);
					} else {
						res.redirect('/post/' + post._id);
					}
				})
			} else if (req.body.action == 'delete') {
				try {
					post.status = 0;
					post.save(function(err, post) {
						res.redirect('/');
					});
				} catch (ex) {
					//   logger.eror(ex);
				}
			}

		});

	});

};