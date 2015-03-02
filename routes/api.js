var restful = require('node-restful');
var mongoose = restful.mongoose;
var Post = require('../models/post');
var JogGroup = require('../models/joggroup');
var restful = require('node-restful');

module.exports = function(app, passport) {

	app.get('/api', function(req, res) {
		res.send('work good');
	});
	Post.register(app, '/api/post');
	JogGroup.register(app, '/api/group'); //微信群

	app.get('/seed/group', function(req, res) {
		var model = new JogGroup({
			name: '每月跑步30km',
			summary: '进群必须每月跑量达30km以上！',
			owner: 'YefanXun',
			local_qr_url: '',
			qiniu_qr_url: '',
			author: mongoose.Types.ObjectId('53246bd3954d580f11000002')
		});
		model.save(function(err, post) {
			if (err) {
				return res.send(err);
			}
			res.send('ok');
		});
	});

	app.get('/seed/daka', function(req, res) {
		var post = new Post({
			source: 'wx',
			type: 'image',
			category: 'daka',
			wx_imge_url: 'http://lovejog.qiniudn.com/6121120221470987402',
			length: 10,
			costtime: 60,
			qiniu_img_url: '',
			wx_openid: '',
			author: mongoose.Types.ObjectId('53246bd3954d580f11000002'),
			sync: 0
		});
		post.save(function(err, post) {
			if (err) {
				return res.send(err);
			}
			res.send('ok');
		});
	});



};