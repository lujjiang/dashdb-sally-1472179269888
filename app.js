var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
//we put all utilities in utils folder, for example, config, logging
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ibmdb = require('ibm_db');
var routes = require('./routes/index');
var app = express();

// using the config util to load the cascading configuration (see utils/config.js for priority order)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3002);


// dashDB
var db2 = services["dashDB"]
    ? services["dashDB"][0].credentials
    : {db: "BLUDB",
        hostname: "xxxx",
        port: 50000,
        username: "xxx",
        password: "xxx"};
var hasConnect = services["dashDB"] ? true : false;

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

// callback - done(err, data)
app.get('/', routes.listSysTables(ibmdb,connString));
app.get('/api/count', routes.count);
app.get('/api/search', routes.search);

// redirect all others to the index (HTML5 history)
// app.get('*', routes.index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err.message);
});

var server = app.listen(process.env.PORT || 3000, function () {
  console.log('server started, listen on port %d', server.address().port);
});

module.exports = app;
