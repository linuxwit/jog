var qiniu = require('node-qiniu');
var wechat = require('wechat');
var Post = require('../models/post');
var User = require('../models/user');

qiniu.config({
    access_key: 'YG9uh4iBBLoeX20AeoAZKQIctJjn0fdH5UXoPNkC',
    secret_key: 'lZAgNj8yCY_TmcPbcX4fPHPqB-Zg1h7IlaOyZpcb'
});

var imagesBucket = qiniu.bucket('lovejog');

module.exports = function (app) {
    app.use('/wechat',wechat('weixin', wechat.text(function (message, req, res, next) {
        var post=new Post({source:'wx',type:'text',content:message.Content,wx_openid:message.FromUserName});
        post.save(function (err, post){
            if (err) {
                console.dir(err);
                return res.reply('发布失败！')
            }
            res.reply('发布图片成功！<a href="">点击查看</a><br/><a href="">点击编辑</a>');
        })

        // message为文本内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125035',
        // MsgType: 'text',
        // Content: 'http',
        // MsgId: '5837397576500011341' }
    }).image(function (message, req, res, next) {
            var key=message.MsgId;
            var puttingStream = imagesBucket.createPutStream(key);
            var request=require('request');
            request(message.PicUrl).pipe(puttingStream)
                .on('error', function(err) {
                    res.reply('由于系统问题，没能收到您的图片'+err);
                })
                .on('end', function(reply) {
                    var post=new Post({source:'wx',type:'image',content:key,wx_openid:message.FromUserName});
                    post.save(function (err, post){
                        if (err) {
                            return res.reply('发布失败！')
                        }
                        res.reply('发布图片成功！');
                    })
                });

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
            var user=new User({wx_openid:message.FromUserName,wx_status:subscribe});
            if (message.Event=='subscribe'){

                user.save(function (err, post){
                    if (err) {
                        return res.reply('关注出现了点问题！')
                    }
                    res.reply('欢迎关注love jog，直接发送文字和图片试试！<a href="">点击注册</a>可以获得更多功能！');
                })
            }
        })));

}
