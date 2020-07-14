var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var WebSocket = require('ws');

// opening a websocket server
const wss = new WebSocket.Server({port: 3002});
wss.on('connection', function(ws) {

  wss.clients.forEach(function(client) {
    /* Update app data */
  })

  ws.on('message', function(message) {
    /* Send to all */
    wss.clients.forEach(function(client) {
        client.send(message);
    })

    /* Modify database */
    var db = new sqlite3.Database('mydb.db');
    db.serialize(function() {
      
      db.run('INSERT INTO games (name) VALUES ("' + data + '")')
      
      let sql = `SELECT game_id FROM games ORDER BY game_id DESC LIMIT 1`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          var gameId = row.game_id;
          console.log(row.game_id);
        });
      });
      
    });
    db.close();
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

//gets changes and sends back updated pug
app.get('*', function(req, res) {
  res.render('index');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Websocket listen
app.listen(3001, function() {
  console.log('listening on port 3001');
});

//SQLite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');

let coordinates = [
  {name:'Korppoo',lat:60.434821, long:22.237775},
  {name:'Annes',lat:60.444473, long:22.245686},
  {name:'Koti',lat:60.444957, long:22.243842}]

db.serialize(function() {

  db.run("CREATE TABLE if not exists tokens (token_id integer PRIMARY KEY, game_id, name TEXT, lat, long, status TEXT, item TEXT)");
  db.run("CREATE TABLE if not exists tasks (task_id integer PRIMARY KEY, game_id, lat, long, status TEXT)");
  db.run("CREATE TABLE if not exists riddles (riddle_id integer PRIMARY KEY, game_id, lat, long, solution, status TEXT)");
  db.run("CREATE TABLE if not exists players (player_id integer PRIMARY KEY, game_id, name TEXT, nickname TEXT, stats)");
  db.run("CREATE TABLE if not exists games (game_id integer PRIMARY KEY, name TEXT, main_end, bank_end, run_bank)");
  
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
