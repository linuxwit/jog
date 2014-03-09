var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema=mongoose.Schema;
var User = require('./user');

var commentSchema=mongoose.Schema({
        posted: { type: Date, default: Date.now },
        author: { type: Schema.Types.ObjectId, ref: 'User',require: true },
        text: {type:String,require: true}
});

var locationSchema=mongoose.Schema({
    x:String,
    y:String,
    scale:number,
    label:String
})

var postSchema = mongoose.Schema({
    title:        String,
    content:      {type:String,require: true},
    wx_imge_url:  String,
    sync:         Number,
    qiniu_img_url:String,
    author:       {type:Schema.Types.ObjectId, ref: 'User',require: true},
    wx_openid:    String,
    posted:       {type: Date, default: Date.now},
    type:         {type:String,require: true},
    location:locationSchema,
    comments:[commentSchema],
    meta:{
        vote:     Number,
        fav:      Number,
        view:     Number
    },
    source:  {type:String}//内容来源weixin等
});

var Post=restful.model("post",postSchema).methods(['get', 'put', 'delete','post']);
module.exports = Post;


