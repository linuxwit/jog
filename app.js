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
var sm = require('sitemap');
var request = require('request');
var MongoStore = require('connect-mongo')(express);
var mongoose = restful.mongoose;

//process.env.NODE_ENV = 'production'
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

console.dir(config.db);
mongoose.connect(config.db);


require('./config/passport')(passport, config)

var models_dir = __dirname + '/models';
fs.readdirSync(models_dir).forEach(function(file) {
    if (file[0] === '.')
        return;
    require(models_dir + '/' + file);
});

//ejs.open = '{{';
//ejs.close = '}}';

var app = express();

// all environments
app.set('port', process.env.VMC_APP_PORT || 8080);
app.set('host', config.host);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.favicon());

app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());


app.use(express.session({
    secret: 'lovejog.com',
    maxAge: 1000 * 60 * 60 * 24 * 365,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));


app.use(passport.initialize());
app.use(passport.session());

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

require('./routes/wechat')(app);

require('./routes/index')(app, passport);

require('./routes/api')(app, passport);

require('./routes/fontend')(app, passport);

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {
        error: err
    });
});

app.use(function(req, res, next) {
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', {
            url: req.url
        });
        return;
    }
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
        return;
    }
    res.type('txt').send('Not found');
});


app.get('/info', function(req, res) {
    res.send(process.env);
})

sitemap = sm.createSitemap({
    hostname: 'http://lovejog.com',
    cacheTime: 600000, // 600 sec - cache purge period
    urls: [{
            url: '/',
            changefreq: 'daily',
            priority: 0.3
        } //,
        // {url: '/page-2/', changefreq: 'monthly', priority: 0.7},
        // {url: '/page-3/'}     // changefreq: 'weekly',  priority: 0.5
    ]
});

app.get('/sitemap.xml', function(req, res) {
    sitemap.toXML(function(xml) {
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

app.get('/robots.txt', function(req, res) {
    res.sendfile(__dirname + '/robots.txt')
        //res.send('User-agent: *');
        // res.
        //res.send('Allow:　/');
})

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});