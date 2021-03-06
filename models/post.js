var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
var User = require('./user');

var commentSchema = mongoose.Schema({
    posted: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    text: {
        type: String,
        require: true
    }
});


var postSchema = mongoose.Schema({
    title: String,
    content: {
        type: String,
        require: true
    },
    category:String,//wenda,daka,bisai,zhipai,为空表示其它
    wx_imge_url: String,
    sync: Number, //同步-1失败，０没有同步，１成功
    qiniu_img_url: String,
    number: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'UserSchema',
        require: true
    },
    wx_openid: String,
    posted: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,//微信消息类型：image,text
        require: true
    },
    status: Number, //０删除,１正常
    location: {
        x: String,
        y: String,
        scale: Number,
        label: String
    },
    comments: [commentSchema],
    meta: {
        vote: Number,
        fav: Number,
        view: Number
    },
    source: {
        type: String
    } //内容来源weixin等
});

var Post = restful.model("post", postSchema).methods(['get', 'put', 'delete', 'post']);
module.exports = Post;




