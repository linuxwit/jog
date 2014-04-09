var qiniu = require('node-qiniu');
var wechat = require('wechat');
//var S = require('string');
var Post = require('../models/post');
var User = require('../models/user');
var qiniu_host = 'http://lovejog.qiniudn.com/';

var mail = require('../middlewares/mail');

qiniu.config({
    access_key: 'YG9uh4iBBLoeX20AeoAZKQIctJjn0fdH5UXoPNkC',
    secret_key: 'lZAgNj8yCY_TmcPbcX4fPHPqB-Zg1h7IlaOyZpcb'
});

var imagesBucket = qiniu.bucket('lovejog');

var host = "http://www.lovejog.com"

module.exports = function (app) {
    app.use('/wechat', wechat('weixin', wechat.text(function (message, req, res, next) {

        if (message.Content.length > 5) {
            var post = new Post({source: 'wx', type: 'text', content: message.Content, wx_openid: message.FromUserName});
            post.save(function (err, post) {
                if (err) {
                    console.dir(err);
                    return res.reply('发布失败！')
                }
                res.reply('发布成功！你可以<a href="' + host + '/edit/' + message.FromUserName + '/' + post._id + '">点击编辑</a>');
                mail.notify(post);
                User.findUserByOpenId(post.wx_openid, function (err, user) {
                    console.log(user);
                    if (user) {
                        post.author = user._id;
                        post.save();
                    }
                })
            })
        } else {
            var input = message.Content;
            if ((/\w+/).test(input)) {
                Post.find({'number': new RegExp(input, 'i')}, function (err, docs) {
                    if (err || docs==null || docs.length==0)
                        return res.reply('非常抱谦，没有找到任何关于' + input + '的信息');

                    var match = new Array();
                    for (var i = 0; i < docs.length; i++) {
                        match.push({
                            title: docs[i].conent,
                            description: '',
                            picurl: qiniu_host + docs[i].qiniu_img_url,
                            url: 'http://www.lovejog.com/post/' + docs[i]._id
                        });

                    }
                    console.log(match);
                    res.reply(match);

                })
            } else
                return res.reply('多说点嘛！');
        }

        // message为文本内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125035',
        // MsgType: 'text',
        // Content: 'http',
        // MsgId: '5837397576500011341' }
    }).image(function (message, req, res, next) {
            var key = message.MsgId;
            var post = new Post({source: 'wx', type: 'image', wx_imge_url: message.PicUrl, qiniu_img_url: key, wx_openid: message.FromUserName, sync: 0});
            post.save(function (err, post) {
                if (err) {
                    console.dir(err);
                    return res.reply('发布失败！')
                }
                res.reply('发布成功！你可以<a href="' + host + '/edit/' + message.FromUserName + '/' + post._id + '">点击编辑</a>');
                mail.notify(post);
                var puttingStream = imagesBucket.createPutStream(key);
                var request = require('request');
                request(message.PicUrl).pipe(puttingStream)
                    .on('error', function (err) {
                        console.dir(err);
                        post.sync = -1;
                        post.save(function (err, post) {
                            if (err) {
                                console.log('save sync -1 fail')
                                console.dir(err);
                            }
                        });
                    })
                    .on('end', function (data) {
                        post.sync = 1;
                        post.save(function (err, post) {
                            if (err) {
                                console.log('save sync 1 fail')
                                console.dir(err);
                            }
                        });
                    });

                //查找是否有没有绑定，如果绑定就更新author
                User.findUserByOpenId(post.wx_openid, function (err, user) {
                    console.log(user);
                    if (user) {
                        post.author = user._id;
                        post.save();
                    }
                })
            })


            // message为图片内容
            // { ToUserName: 'gh_d3e07d51b513',
            // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
            // CreateTime: '1359124971',
            // MsgType: 'image',
            // PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
            // MediaId: 'media_id',
            // MsgId: '5837397301622104395' }
        }).voice(function (message, req, res, next) {
            // message为音频内容
            // { ToUserName: 'gh_d3e07d51b513',
            // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
            // CreateTime: '1359125022',
            // MsgType: 'voice',
            // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
            // Format: 'amr',
            // MsgId: '5837397520665436492' }
        }).video(function (message, req, res, next) {
            // message为视频内容
            // { ToUserName: 'gh_d3e07d51b513',
            // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
            // CreateTime: '1359125022',
            // MsgType: 'video',
            // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
            // ThumbMediaId: 'media_id',
            // MsgId: '5837397520665436492' }
        }).location(function (message, req, res, next) {
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
            var post = new Post({source: 'wx', type: 'location', location: {x: message.Location_X, y: message.Location_Y, scale: message.Scale, label: message.Label}, wx_openid: message.FromUserName});
            console.dir(post);
            post.save(function (err, post) {
                if (err) {
                    console.dir(err);
                    return res.reply('失败了！')
                }
                res.reply('收到！');
                console.log('收到位置信息');
            })

        }).link(function (message, req, res, next) {

            // message为链接内容
            // { ToUserName: 'gh_d3e07d51b513',
            // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
            // CreateTime: '1359125022',
            // MsgType: 'link',
            // Title: '公众平台官网链接',
            // Description: '公众平台官网链接',
            // Url: 'http://1024.com/',
            // MsgId: '5837397520665436492' }
        }).event(function (message, req, res, next) {


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
                res.reply('欢迎关注爱慢跑！直接发送文字和图片试试，可以分享你的打卡记录，也可以是小伙伴的比赛图，如果有小伙们上传了你的比赛图，你也可以输入比赛号来查找你的相片<a href="' + host +'?form=' + message.FromUserName + '">点击浏览</a>可以更好玩哟');

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

}
