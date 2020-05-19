var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var WebSocket = require('ws');

// openning a websocket server
const wss = new WebSocket.Server({port: 3002});
wss.on('connection', function(ws) {
    ws.on('message', function sendToAllClients(message) {
        wss.clients.forEach(function(client) {
            client.send(message);
        })
    })
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
  res.render('index');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(3001, function() {
  console.log('listening on port 3001');
});

//SQLite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');

db.serialize(function() {

  db.run("CREATE TABLE if not exists user_info (info TEXT)");

  db.all("select name from sqlite_master where type='table'", function(err,tables){
    console.log(tables);
  });

});

db.close();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
