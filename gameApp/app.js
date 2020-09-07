var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sqlite3 = require('sqlite3').verbose();
var WebSocket = require('ws');
const { Script } = require('vm');

// opening a websocket server
const wss = new WebSocket.Server({port: 3002});
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    msg=JSON.parse(message)
    if(msg.type=="NewGame"){
      modifyDb(ws, message);
    }
    if(msg.type=="GetGame"){
      fetchGame(ws, msg.data.gameId);
    }
  });
  var jsonCoor = {type: "coordinates"};
  jsonCoor.data = {coordinates};

  wss.clients.forEach(function(client) {
    client.send(JSON.stringify(jsonCoor));
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

let coordinates = [
  {name:'Korppoolaismäki', lat:60.434821, long:22.237775},
  {name:'Kaasukello', lat:60.4, long:22.24},
  {name:'Muumipuisto', lat:60.4, long:22.24},
  {name:'Föri', lat:60.438, long:22.237775}, /*Kodin naatit=lat:60.444957, long:22.243842*/
  {name:'Funikulaari', lat:60.4, long:22.24},
  {name:'Kakola', lat:60.4, long:22.24},
  {name:'Lääninvankila', lat:60.4, long:22.24},
  {name:'Kesäportaat', lat:60.4, long:22.24},
  {name:'Puhelinkoppi', lat:60.4, long:22.24},
  {name:'Myllysilta', lat:60.4, long:22.24},
  {name:'Mylly', lat:60.4, long:22.24},
  {name:'Tykki', lat:60.4, long:22.24},
  {name:'Samppalinnanmäki', lat:60.4, long:22.24},
  {name:'Mantun grilli', lat:60.4, long:22.24},
  {name:'Vartiovuorenmäki', lat:60.4, long:22.24},
  {name:'Tykki', lat:60.4, long:22.24},
  {name:'Kerttulinmäki', lat:60.4, long:22.24},
  {name:'Historicum', lat:60.4, long:22.24},
  {name:'Yliopistonmäki', lat:60.4, long:22.24},
  {name:'Tuomiokirkko', lat:60.4, long:22.24},
  {name:'Vanha suurtori', lat:60.4, long:22.24},
  {name:'Kirjasto', lat:60.4, long:22.24},
  {name:'Juhana III', lat:60.4, long:22.24},
  {name:'Aleksanteri', lat:60.4, long:22.24},
  {name:'Puutorin Vessa', lat:60.4, long:22.24}, 
  {name:'Turun palon syttymispaikka', lat:60.4, long:22.24},
  {name:'Lenin', lat:60.4, long:22.24},
  {name:'Taidemuseo', lat:60.4, long:22.24},
  {name:'Joutsenet', lat:60.4, long:22.24},
  {name:'Ystävyyspatsas', lat:60.4, long:22.24},
]
let tokenSet = [
  "Auran tähti",
  "rosvo",
  "rosvo",
  "rosvo",
  "rubiini",
  "rubiini",
  "smaragdi",
  "smaragdi",
  "smaragdi",
  "topaasi",
  "topaasi",
  "topaasi",
  "topaasi",
  "hevosenkenkä",
  "hevosenkenkä",
  "hevosenkenkä",
  "hevosenkenkä",
  "hevosenkenkä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä",
  "tyhjä"
]

function lottery1(callback) {
  coordinates.forEach(function(item, index, value){
    coordinates[index].lotto = Math.random();
    coordinates[index].rank = index;
  });
  coordinates.sort(compare('lotto'));
  console.log(coordinates[0]);
  callback();
}
function lottery2() {
  coordinates.forEach(function(item, index, value){
    coordinates[index].cat = tokenSet[index];
  });
  coordinates.sort(compare('rank'));
  /*console.log(coordinates.filter(x => x.cat === 'Auran tähti'));*/
};
lottery1(lottery2);

function compare(key) {
  return function innerSort(a, b) {
    const valA = a[key];
    const valB = b[key];
    let comparison = 0;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  };
}

// Preliminary SQLite db

var db = new sqlite3.Database('mydb.db');

db.serialize(function() {

  db.run("CREATE TABLE if not exists tokens (token_id integer PRIMARY KEY, game_id, name TEXT, lat, long, status TEXT, cat TEXT, rank)");
  db.run("CREATE TABLE if not exists tasks (task_id integer PRIMARY KEY, game_id, lat, long, status TEXT)");
  db.run("CREATE TABLE if not exists riddles (riddle_id integer PRIMARY KEY, game_id, lat, long, solution, status TEXT)");
  db.run("CREATE TABLE if not exists players (player_id integer PRIMARY KEY, game_id, name TEXT, nickname TEXT, stats)");
  db.run("CREATE TABLE if not exists games (game_id integer PRIMARY KEY, name TEXT, main_end, bank_end, run_bank)");
  
});
db.close

// Database actions
function modifyDb(ws,message){
    /* Modify database */
    var db = new sqlite3.Database('mydb.db');
    db.serialize(function() {
      
      var json = JSON.parse(message);
      var gameName = json.data.gameName;
      var playerName = json.data.playerName;

      let dbUpdate = new Promise((resolve) => {
        var gamesql=`INSERT INTO games (name) VALUES ("${gameName}")`;
        db.run(gamesql,[],function(err){
          if (err) {
            return console.log(err.message);
          }else{
            console.log(gamesql, this.lastID);
            resolve(this.lastID);
          }
        });
      });

      dbUpdate
        .then((gameId) => playerUpdate(ws,gameId,playerName))
        .then((gameId) => tokenUpdate(gameId))
        .catch(function(err){console.log("Error: "+err.message)});
    });
    db.close()
  }

//SQL functions
function playerUpdate(ws,gameId,playerName){
  var playersql = `INSERT INTO players (game_id, nickname) VALUES (${gameId},"${playerName}")`;
  db.run(playersql,[],function(err){
    if (err) {
      return console.log(err.message);
    }
  });
  console.log(playersql, gameId);

  var msgBack = {type: "NewGame"};
  msgBack.data = {id: gameId, name: playerName};
  
  /* Send to sender */
  ws.send(JSON.stringify(msgBack));

  return gameId;
}

function tokenUpdate(gameId){
  coordinates.forEach(function(item, index, value){
    var lat=coordinates[index].lat;
    var long=coordinates[index].long;
    var cat=coordinates[index].cat;
    var values = `${gameId},${lat},${long},"${cat}"`;
    var tokensql = `INSERT INTO tokens (game_id, lat, long, cat) VALUES (${values})`;
    db.run(tokensql,[],function(err){
      if (err) {
        return console.log(err.message);
      }
    });
  });
}

function fetchGame(ws, gameId){
  var db = new sqlite3.Database('mydb.db');
  var getgamesql = `SELECT name FROM games WHERE game_id=${gameId}`;
  db.get(getgamesql,[],function(err,row){
    if (err) {
      return console.log(err.message);
    }
    var gameName = row.name;
    var json = {type: "GetGame"};
    json.data = {
      gameName: gameName
    };
    ws.send(JSON.stringify(json));
  });
}

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
