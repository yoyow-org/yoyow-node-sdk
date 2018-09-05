var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');

var config = require("./conf/config");

import utils from './lib/utils';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'doc')));

// 跨域设置
var protocols = ['http://', 'https://'];
app.use(function (req, res, next) {
    let origin = req.headers.referer || req.headers.origin || false;
    if (origin) {
        if (origin.endsWith("/")) origin = origin.substr(0, origin.length - 1);
        for (var ao of config.allow_ip) {
            if (origin.startsWith(protocols[0] + ao) || origin.startsWith(protocols[1] + ao)) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Methods', 'GET,POST');
                res.header('Access-Control-Allow-Headers', 'Content-Type');
                res.header('Access-Control-Allow-Credentials', 'true');
            }
        }
    }
    next();
});

/**
 * 处理访问IP限制的中间件
 */
app.use((req, res, next) => {
  let clientIp = utils.getRealIp(req);
  if (config.allow_ip.indexOf(clientIp) < 0) {
      var err = new Error("Forbidden");
      err.status = 403;
      next(err);
  } else {
      next();
  }
});

app.use('/', index);
app.use('/api/v1', api);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
