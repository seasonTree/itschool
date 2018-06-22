var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var cnf = require('./SiteConfig');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'itschool',
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: {
        maxAge: 86400000 // 60 * 60 * 1000 * 24 // 会话保存24小时
    }
}));


app.use(function (req, res, next) {
	var aryHost = req.hostname.split('.');
    if (aryHost.length == 3 && aryHost[0].length >= 2) { // 空间名不得小于2个字符
        var str0 = aryHost[0].toLowerCase();// 空间名不区分大小写，只可为英文字母和数字
		if (cnf.keys.indexOf(str0) < 0) {
            req.url = '/home/' + str0 + '/' + req.url.substr(1);
            next();
        } else {
            next();
        }
    } else {
        next();
    }
});


// app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.htm' }));


app.use('/course', require('./routes/course'));
app.use('/blogs', require('./routes/blogs'));// zoom ?
app.use('/showtime', require('./routes/showtime'));
app.use('/home', require('./routes/home'));
app.use('/my', require('./routes/my'));
app.use('/login', require('./routes/login'));

app.use('/api/user', require('./api/user'));

var mg = require('./routes/_mg');
app.use('/_mg', mg.index);
app.post('/mglogin', mg.mglogin);
app.post('/mglogout', mg.mglogout);
app.use('/mgapi/', mg.mgapi_router);

app.use('/', require('./routes/index'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
