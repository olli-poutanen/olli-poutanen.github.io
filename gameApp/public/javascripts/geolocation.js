let coordinates = [
{name:'Korppoo',lat:60.434821, long:22.237775},
{name:'Annes',lat:60.444473, long:22.245686},
{name:'Koti',lat:60.444957, long:22.243842}]

function getLocation(){ 
	navigator.geolocation.getCurrentPosition(function(position){
		
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
		
    for(let i = 0; i < coordinates.length; i++){
      var geod = geodistance(lat,long,coordinates[i].lat,coordinates[i].long);
      if(geod<limit){document.getElementById("geodistacc").innerHTML = coordinates[i].name + " FOUND";}
      else{document.getElementById("geodistacc").innerHTML = "NOT FOUND";}
		}
    
    document.getElementById("geodisttext").innerHTML = geod.toFixed(1) + "m";
 }, 
	function error(msg) {alert('Please enable your GPS position feature.');},
  {maximumAge:0, timeout:5000, enableHighAccuracy: true});
}

document.getElementById("changelimit5").addEventListener("click",changelimit);
document.getElementById("changelimit10").addEventListener("click",changelimit);
document.getElementById("changelimit25").addEventListener("click",changelimit);
document.getElementById("changelimit50").addEventListener("click",changelimit);

limit=5;

function changelimit(){
	limit=this.getAttribute("meters");
}
