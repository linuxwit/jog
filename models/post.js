var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
var User = require('./user');
var moment = require('moment');
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
    },
    meta: {
        up: Number,
        down: Number
    }
});
var postSchema = mongoose.Schema({
    title: String,
    content: {
        type: String,
        require: true
    },
    category: String, //wenda,daka,bisai,zhipai,fenxiang,为空表示其它
    wx_imge_url: String,
    sync: Number, //同步-1失败，０没有同步，１成功
    qiniu_img_url: String,
    number: String,
    length: Number,
    costtime: Number,
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
        type: String, //微信消息类型：image,text
        require: true
    },
    msgid: String,
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
/**
 * 添加评论
 * @param {[type]}   postId  [description]
 * @param {[type]}   comment [description]
 * @param {Function} done    [description]
 */
postSchema.statics.addComment = function(postId, comment, done) {
    var Post = this;
    Post.findOne({
        _id: postId
    }, function(err, post) {
        if (err) {
            done(err);
        }
        if (!post.comments) {
            post.comments = [];
        }
        post.comments.push(comment);
        Post.update({
            _id: postId
        }, {
            comments: post.comments
        }, function(err, doc) {
            done(err, doc);
        });
    });
};
/**
 * [getMonthTop 得到月排名]
 * @param  {[type]}   userId [description]
 * @param  {[type]}   time   [description]
 * @param  {Function} done   [description]
 * @return {[type]}          [description]
 */
postSchema.statics.getMonthTop = function(userId, time, done) {
    var Post = this;
    var d = moment(time, 'YYYY-MM'); //按照指定的年月字符串和格式解析出一个moment的日期对象
    var firstDate = d.startOf("month"); //通过startOf函数指定取月份的开始即第一天
    var lastDate = d.endOf("month"); //通过startOf函数指定取月份的末尾即最后一天
 
    var start = d.startOf("month").format();
    var end = d.endOf("month").format();
    console.log('开始', start);
    console.log('结束', end);
    Post.aggregate({
        $match: {
            category: "daka",
            posted: { $gte: new Date(start),$lte:new Date(end) }
        }
    }, {
        $group: {
            _id: {
                author: "$author",
                "year": {
                    $year: "$posted"
                },
                "month": {
                    $month: "$posted"
                }
            },
            total: {
                $sum: "$length"
            },
            count: {
                $sum: 1
            }
        }
    }, {
        $sort: {
            total: -1
        }

    }, function(err, docs) {
        done(err, docs);
    });
}
var Post = restful.model("post", postSchema).methods(['get', 'put', 'delete', 'post']);
module.exports = Post;