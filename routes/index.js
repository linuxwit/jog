var post=require('../models/post');
var moment = require('moment');
module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        moment.lang('zh-cn');
        var page=req.param("page")?parseInt(req.param("page")):0;
        var query= post.find({}, {}, { skip: page*10, limit: 10 }).sort({ posted: 'desc' });
         query.exec(function (err, docs) {
            res.render('index',{
                posts:docs,
                moment:moment,
                page:page,
                qiniu_host:'http://lovejog.qiniudn.com'});
        })
    })
}