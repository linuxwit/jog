var restful = require('node-restful');
var mongoose = restful.mongoose;
var Post = require('../models/post');
var JogGroup = require('../models/joggroup');
var restful = require('node-restful');
var qiniu = require('node-qiniu');
qiniu.config({
	    access_key: 'YG9uh4iBBLoeX20AeoAZKQIctJjn0fdH5UXoPNkC',
	    secret_key: 'lZAgNj8yCY_TmcPbcX4fPHPqB-Zg1h7IlaOyZpcb'
});
var imagesBucket = qiniu.bucket('lovejog');

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
			author: mongoose.Types.ObjectId('54f46ec06fda89140b282ebe')
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
			author: mongoose.Types.ObjectId('54f46ec06fda89140b282ebe'),
			sync: 0
		});
		post.save(function(err, post) {
			if (err) {
				return res.send(err);
			}
			res.send('ok');
		});
	});


   app.get('/upload/:id',function(){
	
   		 var imgurl='';
   	     var puttingStream = imagesBucket.createPutStream(id);
                var request = require('request');
                request(imgurl).pipe(puttingStream)
                    .on('error', function(err) {
                    	console.log('同步失败');
                        console.dir(err);

                    })
                    .on('end', function(data) {

                    });
   })


};