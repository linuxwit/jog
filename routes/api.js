var Post = require('../models/post');
var JogGroup = require('../models/joggroup');
var restful = require('node-restful');

module.exports = function(app, passport) {

	app.get('/api', function(req, res) {
		res.send('work good');
	})
	Post.register(app, '/api/post');
	JogGroup.register(app, '/api/group');//微信群

}