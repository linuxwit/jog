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
            var post=new Post({source:'wx',type:'image',wx_imge_url:message.PicUrl,qiniu_img_url:key,wx_openid:message.FromUserName,sync:0});
            post.save(function (err, post){
                if (err) {
                    console.dir(err);
                    return res.reply('发布失败！')
                }
                res.reply('发布图片成功！');
                console.log('发布图片成功');

                var puttingStream = imagesBucket.createPutStream(key);
                var request=require('request');
                request(message.PicUrl).pipe(puttingStream)
                    .on('error', function(err) {
                        console.dir(err);
                        post.sync=-1;
                        post.save(function (err, post){
                            if (err){
                                console.log('save sync -1 fail')
                                console.dir(err);
                            }
                        });
                    })
                    .on('end', function(data) {
                        post.sync=1;
                        post.save(function (err, post){
                            if (err){
                                console.log('save sync 1 fail')
                                console.dir(err);
                            }
                        });
                    });
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
            var post=new Post({source:'wx',type:'location',location:{x:message.Location_X,y:message.Location_Y,scale:message.Scale,label:message.Label},wx_openid:message.FromUserName});
            console.dir(post);
            post.save(function (err, post){
                if (err) {
                    console.dir(err);
                    return res.reply('失败了！')
                }
                res.reply('收到！');
                console.log('收到位置信息');
                console.dir(post);
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
            var user=new User({wx_openid:message.FromUserName,wx_status:subscribe});
            if (message.Event=='subscribe'){

                user.save(function (err, post){
                    if (err) {
                        return res.reply('关注出现了点问题！')
                    }
                   return res.reply('欢迎关注love jog，直接发送文字和图片试试！<a href="">点击注册</a>可以获得更多功能！');
                })
            }
        })));

}
