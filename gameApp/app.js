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
    if(msg.type=="SearchTokens"){
      doSearch(ws, msg.data.gameId, msg.data.lat, msg.data.long, msg.data.limit);
    }
  });

  wss.clients.forEach(function(client) {
    //Send something to everyone
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

//coordinates and token selection
let coordinates = [
  {name:'Korppolaismäki', lat:60.434821, long:22.237775},
  {name:'Kaasukello', lat:60.4, long:22.24},
  {name:'Muumipuisto', lat:60.4, long:22.24},
  {name:'Föri', lat:60.444957, long:22.243842}, /*Kodin naatit=lat:60.444957, long:22.243842*/
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
coordinates.forEach(function(row, index) {
  row.rank = index;
  row.status=0;
});
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

// Preliminary SQLite db

var db = new sqlite3.Database('mydb.db');

db.serialize(function() {

  db.run("CREATE TABLE if not exists tokens (token_id integer PRIMARY KEY, game_id, name TEXT, lat, long, status, cat TEXT, rank)");
  db.run("CREATE TABLE if not exists tasks (task_id integer PRIMARY KEY, game_id, lat, long, status TEXT)");
  db.run("CREATE TABLE if not exists riddles (riddle_id integer PRIMARY KEY, game_id, lat, long, solution, status TEXT)");
  db.run("CREATE TABLE if not exists players (player_id integer PRIMARY KEY, game_id, name TEXT, nickname TEXT, stats)");
  db.run("CREATE TABLE if not exists games (game_id integer PRIMARY KEY, name TEXT, end_time, remaining_time, run_main)");
  
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
            resolve(this.lastID);
          }
        });
      });

      dbUpdate
        .then((gameId) => playerUpdate(gameId,playerName))
        .then((gameId) => tokenUpdate(gameId))
        .then((gameId)=> gameCreated(ws,gameId,playerName))
        .catch(function(err){console.log("Error: "+err.message)});
    });
    db.close()
  }
  

//Update player to db
function playerUpdate(gameId,playerName){
  var playersql = `INSERT INTO players (game_id, nickname) VALUES (${gameId},"${playerName}")`;
  db.run(playersql,[],function(err){
    if (err) {
      return console.log(err.message);
    }
  });
  return gameId;
}
//Update tokens to db
function tokenUpdate(gameId){
  coordinates.forEach(function(item, index, value){
    var lat=coordinates[index].lat;
    var long=coordinates[index].long;
    var cat=coordinates[index].cat;
    var name=coordinates[index].name;
    var status=coordinates[index].status;
    var rank=coordinates[index].rank;
    var values = `${gameId},"${name}",${lat},${long},"${cat}", "${status}", ${rank}`;
    var tokensql = `INSERT INTO tokens (game_id, name, lat, long, cat, status, rank) VALUES (${values})`;
    db.run(tokensql,[],function(err){
      if (err) {
        return console.log(err.message);
      }
    });
  });
  return gameId;
}

function updateTokenStatus(gameId, rank){
 var tokensql= `UPDATE tokens SET status = 1 WHERE game_id=${gameId} AND rank = ${rank}`
 db.run(tokensql,[],function(err){
  if (err) {
    return console.log(err.message);
  }
});
}

function gameCreated(ws,gameId,playerName){
  var msgBack = {type: "NewGame"};
  msgBack.data = {id: gameId, name: playerName};
  /* Send to sender */
  console.log("meni läpi");
  ws.send(JSON.stringify(msgBack));
}

//fetch game and send info
function fetchGame(ws, gameId){

  var db = new sqlite3.Database('mydb.db');
  var checkgamesql = `SELECT count(*) as count FROM games WHERE game_id=${gameId}`;
  //check if game exists
  getOut=db.get(checkgamesql,[],function(err,row){
    if (err) {
      return console.log(err.message);
    }
    if(row.count==0){
      return true;
    }
  });
  
  //get out if not
  if(getOut){
    var jsonOut = {type: "BadCookie"};
    ws.send(JSON.stringify(jsonOut));
  }

  else{
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

    var getcoorsql = `SELECT * FROM tokens WHERE game_id=${gameId}`;
    db.all(getcoorsql,[],function(err,rows){
      if (err) {
        return console.log(err.message);
      }
      var json = {type: "coordinates"};
      var coords = [];
      for (var i = 0;i < rows.length; i++) {
        coords.push({lat: rows[i].lat, long: rows[i].long, cat: rows[i].cat, status: rows[i].status, rank: rows[i].rank});
      }
      json.data = {coords};
      ws.send(JSON.stringify(json));
    });
  }
}
//search tokens
function doSearch(ws,gameId,lat,long, limit){
  var db = new sqlite3.Database('mydb.db');
  var getcoorsql = `SELECT * FROM tokens WHERE game_id=${gameId}`;
  db.all(getcoorsql,[],function(err,rows){
    if (err) {
      return console.log(err.message);
    }
    var coords = [];
    for (var i = 0;i < rows.length; i++) {
      coords.push({lat: rows[i].lat, long: rows[i].long, cat: rows[i].cat, name: rows[i].name, status: rows[i].status, rank: rows[i].rank});
    }
    for(var i = 0; i < coords.length; i++){
      var geod = geodistance(lat,long,coords[i].lat,coords[i].long);
      //console.log(coords[i].cat+" <> "+Math.round(geod)+"m");
      if(geod<limit){
        var json = {type: "SearchTokens"};
        json.data = {result: "Found", cat: coords[i].cat, name: coords[i].name, geod: geod, rank: coords[i].rank};
        updateTokenStatus(gameId,coords[i].rank);
        ws.send(JSON.stringify(json));
        return;
      }
      var json = {type: "SearchTokens"};
      json.data = {result: "Not found"};
      ws.send(JSON.stringify(json));
    }
  });
}


//funktioita
function lottery1(callback) {
  coordinates.forEach(function(item, index, value){
    coordinates[index].lotto = Math.random();
  });
  coordinates.sort(compare('lotto'));
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
function geodistance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var geodist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (geodist > 1) {
      geodist = 1;
    }
    geodist = Math.acos(geodist);
    geodist = geodist * 180/Math.PI;
    geodist = geodist * 60 * 1.1515;
    geodist = geodist * 1.609344;
    geodist = geodist*1000;
    return geodist;
  }
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
