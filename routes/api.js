var Post = require('../models/post');
var restful = require('node-restful');

module.exports = function (app, passport) {

    app.get('/api',function(req,res){
        res.send('aaaaaa');
    })


    Post.register(app, '/api/post');
}