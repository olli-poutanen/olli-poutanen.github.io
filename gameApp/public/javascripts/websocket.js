const ws = new WebSocket('ws://localhost:3002');

ws.onopen = function() {
  console.log('connection established');
};

/* Kuuntelee viestiä serveriltä ja tekee käyttäjille uuden rivin saatuaan viestin */
ws.onmessage = function(event) {

  var msg = JSON.parse(event.data);

  if(msg.type=="NewGame" || msg.type=="PlayerJoin"){
    updateStats(msg);
  }
  if(msg.type=="coordinates"){
    createMap(msg);
  }

  if(msg.type=="NewGame"){
    gameId=msg.data.id
    setCookie("game", gameId, 30);
  }

  if(msg.type=="GetGame"){
    gameName=msg.data.gameName;
    document.getElementById("title").innerHTML=gameName;
  }

}

/* Lähettää viestin serverille */
const form = document.getElementById('gamedata');
form.addEventListener('submit', function(event) {
  const textGame = document.getElementById('game-name');
  const textPlayer = document.getElementById('player-name');
  const gameName = textGame.value;
  const playerName = textPlayer.value;
  textGame.value = '';
  textPlayer.value = '';
  json = {type: "NewGame"};
  json.data = {gameName, playerName};
  ws.send(JSON.stringify(json));
  event.preventDefault();
});


/*funktioita*/

createMap=function(msg){
  /*lisää kohteet kartalle*/
    msg.data.coordinates.forEach(function(row){
        map1.addLayer(L.circle([row.lat, row.long], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
        radius: 40})
        )
    });

    var locmarker;
    map1.locate({
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

updateStats=function(msg){
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