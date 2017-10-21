require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis')

var index = require('./routes/index');

var fs = require('fs');
var http = require('http');
var https = require('https');

var googleSearchApi = require('./apis/googlesearch');
var rawData = require('./apis/googlesearch/raw_webmaster_data.json');
const googleTrends = require('google-trends-api');


if(false) {
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/simplex.ev.io/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/simplex.ev.io/fullchain.pem', 'utf8');
  
  var credentials = {key: privateKey, cert: certificate};
  
  // your express configuration here
} else {
  var credentials = {key: "", cert: ""}
}



var app = express();
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);





//Redis shit.
var client = redis.createClient('6379', 'simplex.ev.io');

var dataString = JSON.stringify(rawData);

// client.set('wm_data_test', dataString, function(err, res) {
//   console.log(res);
//   return res;
// })

// client.get('wm_data_test', function(err, res) {
//   console.log(JSON.parse(res));
//   return res;
// })

// var reportStruct = {};
// rawData['rows'].forEach(function(row){
//   console.log(row);
// });


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade');

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.use('/*', index);

httpServer.listen(8080);
httpsServer.listen(8443);

module.exports = app;
