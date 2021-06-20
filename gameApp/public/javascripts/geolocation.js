
let limit=50;
function searchTokens(){ 
  map1.locate({maximumAge:20000, timeout:5000, enableHighAccuracy: true}).on('locationfound',(e) => {
    var lat  = e.latitude;
    var long = e.longitude;
    var lat = 60.444957;
    var long = 22.243842;
    var gameId=getCookie("game");
    document.getElementById("geoloc").innerHTML = " lat: " + Math.round(lat * 1000) / 1000 + " long: " + Math.round(long * 1000) / 1000;
  
    var json = {type: "SearchTokens"};
    json.data = {gameId: gameId, lat: lat, long: long, limit: limit};
    ws.send(JSON.stringify(json));
  });
}

document.getElementById("changelimit5").addEventListener("click",changelimit);
document.getElementById("changelimit10").addEventListener("click",changelimit);
document.getElementById("changelimit25").addEventListener("click",changelimit);
document.getElementById("changelimit50").addEventListener("click",changelimit);

function changelimit(){
	limit=this.getAttribute("meters");
}


	// navigator.geolocation.getCurrentPosition(function(position){
  //   var lat  = position.coords.latitude;
  //   var long = position.coords.longitude;
  //   alert(lat + " " + long);
  //   var gameId=getCookie("game");
  //   document.getElementById("geoloc").innerHTML = " lat: " + Math.round(lat * 1000) / 1000 + " long: " + Math.round(long * 1000) / 1000;
  
  //   var json = {type: "SearchTokens"};
  //   json.data = {gameId: gameId, lat: lat, long: long, limit: limit};
  //   ws.send(JSON.stringify(json));
  // }, 
  //   showError,
  //   {maximumAge:20000, timeout:5000, enableHighAccuracy: true}
  // );
function showError(error) {
  var x = document.getElementById("demo");
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

