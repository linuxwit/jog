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
			owner:'YefanXun',
			local_qr_url: '',
			qiniu_qr_url: '',
			author: 1000
		});
		model.save(function(err, post) {
			if (err) {
				return res.send(err);
			}
			res.send('ok');
		});
	});

};