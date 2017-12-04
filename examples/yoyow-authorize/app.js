var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var Auth = require('./routes/Auth');
var api = require('./routes/api');
var config = require("./conf/config");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 处理访问IP限制的中间件
 */
app.use((req, res, next) => {
    let real_ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    if (real_ip === "::1") real_ip = "127.0.0.1";
    let clientIp = real_ip.match(/\d+/g).join('.');
    if (config.allow_ip.indexOf(clientIp) < 0) {
        var err = new Error("Forbidden");
        err.status = 403;
        next(err);
    } else {
        next();
    }
});

app.use('/', index);
app.use('/auth', Auth);
app.use('/api/v1', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
