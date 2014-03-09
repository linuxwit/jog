/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var restful = require('node-restful');
var api = require('./routes/api');
var http = require('http');
var path = require('path');
var passport = require("passport");
//var mongoose = require('mongoose');
var flash = require("connect-flash");
var fs = require('fs');
var ejs = require('ejs');


var request = require('request');

var mongoose = restful.mongoose;

//process.env.NODE_ENV = 'production'

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

console.dir(env);
mongoose.connect(config.db);

var models_dir = __dirname + '/models';
fs.readdirSync(models_dir).forEach(function(file) {
    if (file[0] === '.')
        return;
    require(models_dir + '/' + file);
});

ejs.open = '{{';
ejs.close = '}}';

var app = express();

// all environments
app.set('port', process.env.VMC_APP_PORT  || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.query());




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/info',function(req,res){
    res.send(process.env);
})

require('./routes/wechat')(app);

require('./routes/index')(app, passport);

require('./routes/api')(app, passport);


//test

var validateUser = function(req, res, next) {
    return next();
}

var Note = restful.model("note", mongoose.Schema({
        title: { type: 'string', required: true},
        body: { type: 'string', required: true},
        creator: { type: 'ObjectId', ref: 'user', require: true}
    }))
    .methods(['get', 'delete', { method: 'post', before: validateUser }, { method: 'put', before: validateUser }]);

Note.register(app, '/note');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
