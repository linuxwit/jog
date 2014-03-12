var post=require('../models/post');

module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        var page=req.param("page")?parseInt(req.param("page")):0;
        var query= post.find({}, {}, { skip: page*10, limit: 10 }).sort('posted -1');
         query.exec(function (err, docs) {
            res.render('index',{posts:docs,page:page,qiniu_host:'http://lovejog.qiniu.com'});
        });

    })
}