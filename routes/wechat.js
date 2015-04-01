var qiniu = require('node-qiniu');
var wechat = require('wechat');
var log4js = require('log4js');
var moment = require('moment');
var fs = require('fs');
var Post = require('../models/post');
var User = require('../models/user');
var qiniu_host = 'http://lovejog.qiniudn.com/';
var mail = require('../middlewares/mail');
qiniu.config({
	access_key: 'YG9uh4iBBLoeX20AeoAZKQIctJjn0fdH5UXoPNkC',
	secret_key: 'lZAgNj8yCY_TmcPbcX4fPHPqB-Zg1h7IlaOyZpcb'
});
var imagesBucket = qiniu.bucket('lovejog');
var host;



/**
 * 1.检查用户有没有绑定微信群
 * 2.如果没有绑定，提示先绑定帐号，绑定成功后，跳转到到加微信群页面，选择群
 * 3 如果已经绑定，返回正常连接
 */
module.exports = function(app) {
	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(__dirname + '/../logs/wechat.log'), 'wechat');
	var log = log4js.getLogger('wechat');
	log.setLevel('DEBUG');

	host = app.get('host');
	var help = function(res, message) {
		var msg = [];
		msg.push('非常感谢您来到爱慢跑社区，您可以使用如下功能：\n\n');
		msg.push('1: 发送文字提问\n');
		msg.push('2: 发送慢跑打卡图片\n');
		msg.push('3: 发送精彩赛事相片\n');
		msg.push('4: 发送位置寻找同城小伙伴\n');
		msg.push('5: 发送比赛号码找赛事相片\n');
		msg.push('6: 需要更多功能,请发文字告诉“LoveJog”\n\n');
		msg.push('为了您能正常的使用上面的功能, 请先<a href="' + host + '/bind/' + message.FromUserName + '">点击绑定微信</a>');
		res.reply(msg.join(""));
	};

	app.use('/wechat', wechat('weixin', wechat.text(function(message, req, res, next) {
		if (message.Content.substring(0, 5).toLowerCase() == 'name:') {
			var nickname = message.Content.substring(5);
			User.findUserByOpenId(message.FromUserName, function(err, user) {
				if (user) {
					user.nickname = nickname;
					user.save(function(err, doc) {
						console.log(err);
						if (err) return res.reply('修改失败');
						res.reply('你的呢称为:' + doc.nickname);
					});
				} else {
					res.reply('');
				}
			});
		} else if (message.Content.length > 10) {
			//1.检查用户是否绑定，如果没有绑定，不保存任何信息
			User.findUserByOpenId(message.FromUserName, function(err, user) {
				if (err) {
					return res.reply('系统跑累了，正在休息，请稍后再试,如果还是这样子，请告诉我们');
				}
				if (!user) {
					return help(res, message); //没有绑定
				}
				var post = new Post({
					source: 'wx',
					type: 'text',
					category: 'wenda',
					content: message.Content,
					wx_openid: message.FromUserName,
					author: user._id
				});
				post.save(function(err, post) {
					if (err) {
						console.dir(err);
						return res.reply('发布失败！');
					}
					res.reply('发布成功！<a href="' + host + 'wx/wenda/' + post._id + '">点击编辑一下，可分享给朋友</a>');
					mail.notify(post);
				});
			});
		} else {
			var input = message.Content;
			if ((/\w+/).test(input)) {
				Post.find({
					'number': new RegExp(input, 'i')
				}, function(err, docs) {
					if (err || docs === null || docs.length === 0)
						return res.reply('非常抱谦，没有找到任何关于' + input + '的信息\n告诉身边的人，让更多的加入我们，这样就有机会查找到相片了');
					var match = [];
					for (var i = 0; i < docs.length; i++) {
						match.push({
							title: docs[i].conent,
							description: '',
							picurl: qiniu_host + docs[i].qiniu_img_url,
							url: host + '/post/' + docs[i]._id
						});
					}
					console.log(match);
					return res.reply(match);
				});
			} else {
				switch (input) {
					case '绑定':
						res.reply('<a href="' + host + '/bind/' + message.FromUserName + '">点击绑定</a>');
						break;
					case '帮助':
						help(res, message);
						break;
					case '排名':
						var premonth = moment().add({
							months: -1
						}).format('YYYYMM');
						res.reply('<a href="' + host + '/wx/report/' + premonth + '">点击查看上月排名</a>');
						break
					default:
						return res.reply('骚年,需要帮助请发送［帮助］');

				}
			}

		}
		// message为文本内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125035',
		// MsgType: 'text',
		// Content: 'http',
		// MsgId: '5837397576500011341' }
	}).image(function(message, req, res, next) {
		User.findUserByOpenId(message.FromUserName, function(err, user) {
			if (err) {
				return res.reply('系统跑累了，正在休息，请稍后再试,如果还是这样子，请告诉我们');
			}
			if (!user) {
				return help(res, message); //没有绑定
			}

			var key = message.MsgId;
			log.debug('msgid' + key);
			Post.findOne({
				msgid: key
			}, {}, function(err, doc) {
				if (err) {
					log.error(error);
					return res.reply('上传失败！请重试');
				}
				if (doc) {
					log.debug('正在处理..');
					return res.reply("");
				}

				var post = new Post({
					source: 'wx',
					type: 'image',
					wx_imge_url: message.PicUrl,
					qiniu_img_url: key,
					wx_openid: message.FromUserName,
					author: user._id,
					sync: 0
				});

				post.save(function(err, _post) {
					if (err) {
						log.error(err);
						return res.reply('上传失败！');
					}
					res.reply('上传成功!\n<a href="' + host + '/wx/post/' + _post._id + '">点击添加公里数或者参赛号</a>');
					mail.notify(_post);
					var puttingStream = imagesBucket.createPutStream(key);
					var request = require('request');
					log.debug('sync:' + message.PicUrl);

					/*
					request(message.PicUrl).pipe(puttingStream)
						.on('error', function(err) {

							log.error('同步失败');
							console.dir(err);
							_post.sync = -1;
							_post.save(function(err, post) {
								if (err) {
									log.error('save sync -1 fail');
									log.error(err);
								}
							});
						})
						.on('end', function(data) {
							_post.sync = 1;
							_post.save(function(err, post) {
								if (err) {

									log.error(err);
									log.error('save sync 1 fail');
								} else {
									log.info('同步成功');
								}
							});
						});
					*/

					request(message.PicUrl).pipe(fs.createWriteStream(key)).on('finish', function(data) {
						imagesBucket.putFile(key, key)
							.then(
								function(reply) {
									// 上传成功
									log.debug(reply);
									_post.sync = 1;
									_post.save();
								},
								function(err) {
									// 上传失败
									log.error(err);
									_post.sync = 0;
									_post.save();
								}
							);
					});

				});
			});

		});

		// message为图片内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359124971',
		// MsgType: 'image',
		// PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
		// MediaId: 'media_id',
		// MsgId: '5837397301622104395' }
	}).voice(function(message, req, res, next) {
		// message为音频内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125022',
		// MsgType: 'voice',
		// MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
		// Format: 'amr',
		// MsgId: '5837397520665436492' }
	}).video(function(message, req, res, next) {
		// message为视频内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125022',
		// MsgType: 'video',
		// MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
		// ThumbMediaId: 'media_id',
		// MsgId: '5837397520665436492' }
	}).location(function(message, req, res, next) {
		// message为位置内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125311',
		// MsgType: 'location',
		// Location_X: '30.283950',
		// Location_Y: '120.063139',
		// Scale: '15',
		// Label: {},
		// MsgId: '5837398761910985062' }
		console.dir(message);
		var post = new Post({
			source: 'wx',
			type: 'location',
			location: {
				x: message.Location_X,
				y: message.Location_Y,
				scale: message.Scale,
				label: message.Label
			},
			wx_openid: message.FromUserName
		});
		console.dir(post);
		post.save(function(err, post) {
			if (err) {
				console.dir(err);
				return res.reply('失败了！');
			}
			res.reply('收到位置信息！(开发中...)');
			console.log('收到位置信息');
		});
	}).link(function(message, req, res, next) {
		// message为链接内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125022',
		// MsgType: 'link',
		// Title: '公众平台官网链接',
		// Description: '公众平台官网链接',
		// Url: 'http://1024.com/',
		// MsgId: '5837397520665436492' }
	}).event(function(message, req, res, next) {
		// message为事件内容
		// { ToUserName: 'gh_d3e07d51b513',
		// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
		// CreateTime: '1359125022',
		// MsgType: 'event',
		// Event: 'LOCATION',
		// Latitude: '23.137466',
		// Longitude: '113.352425',
		// Precision: '119.385040',
		// MsgId: '5837397520665436492' }
		if (message.Event == 'subscribe') {
			var msg = [];
			help(res, message);
			//res.reply('直接发送文字和图片试试，可以分享你的打卡记录，也可以是小伙伴的比赛图，如果有小伙们上传了你的比赛图，你也可以输入比赛号来查找你的相片<a href="' + host + '?form=' + message.FromUserName + '">点击浏览</a>可以更好玩哟');
			/*
			var user=new User({wx_openid:message.FromUserName,wx_status:subscribe});
			user.save(function (err, user){
			if (err) {
			return res.reply('关注出现了点问题！')
			}

			return res.reply('欢迎关注love jog，直接发送文字和图片试试！<a href="">点击注册</a>可以获得更多功能！');
			})*/
		} else {
			res.reply("");
		}
		mail.event(message);
	})));
};