const ws = new WebSocket('ws://localhost:3002');

ws.onopen = function() {
  console.log('connection established');
};

/* Kuuntelee viestiä serveriltä ja tekee käyttäjille uuden rivin saatuaan viestin */
ws.onmessage = function(event) {
  
  var msg = JSON.parse(event.data);
 
  if(msg.type=="BadCookie"){
    document.getElementById("testaus").innerHTML = "BAD DATES";
  //  document.cookie = "game=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  //  location.reload();
  }
  
  if(msg.type=="NewGame" || msg.type=="PlayerJoin"){
    gameId=msg.data.id
    setCookie("game", gameId, 30);
    getGameData(gameId);
    hideTablink('show-first');
    unhideTablink('hidden-first');
    document.getElementById('mainbutton').click();
  }
  if(msg.type=="coordinates"){
    createMap(msg);
  }

  if(msg.type=="GetGame"){
    gameName=msg.data.gameName;
    document.getElementById("title").innerHTML=gameName;
    updateStats(msg.data);
  }

  if(msg.type=="SearchTokens"){
    var result=msg.data.result;
    if(result=="Found"){
      document.getElementById("geodistacc").innerHTML = msg.data.cat + " found from " + msg.data.name;
      document.getElementById("geodisttext").innerHTML = msg.data.geod.toFixed(1) + "m" + " indeksi: " + msg.data.index;
      tokenAnimation(msg.data.cat,msg.data.rank);
      map1.layerset[msg.data.rank].setStyle({
        color: 'red',
        fillColor:'red'
      });
    }
    else{
      document.getElementById("geodistacc").innerHTML = "NOT FOUND";
    }
  }
}

/* Luo pelin*/
const form = document.getElementById('gamedata');
form.addEventListener('submit', function(event) {
  const textGame = document.getElementById('game-name');
  const textPlayer = document.getElementById('player-name');
  var gameName = textGame.value;
  var playerName = textPlayer.value;
  textGame.value = '';
  textPlayer.value = '';
  var json = {type: "NewGame"};
  json.data = {gameName, playerName};
  ws.send(JSON.stringify(json));
  event.preventDefault();
});


/*funktioita*/

function createMap(msg){
  /*lisää kohteet kartalle*/
  map1.layerset=[];

    mapBlackdots(msg.data.coords,100); //param2=distance between dots
    mapTokens(msg.data.coords);

    var locmarker;
    map1.locate({
      maximumAge:20000, timeout:5000,
      watch: true,
      enableHighAccuracy: true,
      zoom: 14
    }).on('locationfound',(e) => {
      if(!locmarker){
        locmarker=L.marker(e.latlng);
        locmarker.addTo(map1);
      }else{
        locmarker.setLatLng(e.latlng);
      }
    });
}

function updateStats(msg){
  /*päivitä statsit*/
    var tableRef = document.getElementById('stats').getElementsByTagName('tbody')[0];
    var newRow = tableRef.insertRow(tableRef.rows.length);
    var playerCell  = newRow.insertCell(0);
    var drinkCell  = newRow.insertCell(1);
    playerCell.innerHTML = "player";
    drinkCell.innerHTML = 1;
}

function getGameData(gameId){
  json = {type: "GetGame"};
  json.data = {gameId};
  ws.send(JSON.stringify(json));
}

function tokenAnimation(cat, rank, player){
  
}

function mapTokens(coords){
  coords.forEach(function(row){
    if(row.status==1){
      map1.layerset[row.rank]=L.circle([row.lat, row.long], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
        radius: 40}
      )
    }
    if(row.status==0){
      map1.layerset[row.rank]=L.circle([row.lat, row.long], {
        color: 'black',
        weight: 1,
        fillColor: 'orange',
        fillOpacity: 1,
        radius: 40}
      )
    }
    map1.addLayer(map1.layerset[row.rank])
  });
}

function mapBlackdots(coords,distBtwn){
  var maxim = Math.max.apply(Math, coords.map(function(o) { return o.rank; }))
  for (var i = 0; i < maxim; i++) {
    var a=coords.find(x => x.rank === i);
    var b=coords.find(x => x.rank === i+1);
    var dist=geodistance(a.lat,a.long,b.lat,b.long);
    var numdots=Math.floor(dist/distBtwn)-1;
    var latShift=(b.lat-a.lat)/numdots;
    var longShift=(b.long-a.long)/numdots;
    for (var j = 1; j < numdots; j++) {
      L.polyline([[a.lat,a.long],[a.lat+latShift*j, a.long+longShift*j]], {
        color: 'black',
        weight: 5,
      }).addTo(map1);
      //twice to get "border"
      L.polyline([[a.lat,a.long],[a.lat+latShift*j, a.long+longShift*j]], {
        color: 'white',
        weight: 4,
      }).addTo(map1);
    }
    for (var k = 1; k < numdots; k++) {
      L.circle([a.lat+latShift*k, a.long+longShift*k], {
        color: 'black',
        fillColor: 'black',
        fillOpacity: 1,
        radius: 10}).addTo(map1);
    }
  }
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