//functions//
function leadingZero(n) {
    return n < 10 ? "0" + n : n;
  }

//Updated time from server//
  ws.onmessage = function(event) {

    var msg = JSON.parse(event.data);
  
    if(msg.type=="NewGame" || msg.type=="PlayerJoin" || msg.type=="GetGame"){

    }

  }

//Default time//
var Hours=1;
var Minutes=0;
var Seconds=0;

var cntDownDate = new Date(new Date().getTime() + Hours * 60 * 60 * 1000);

document.getElementById("clock").innerHTML = Hours + ":" + leadingZero(Minutes) + ":" + leadingZero(Seconds);

//Start//
function startClock(){

    var interval = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var dist = cntDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var Hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var Minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        var Seconds = Math.floor((dist % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("clock").innerHTML = Hours + ":" + leadingZero(Minutes) + ":" + leadingZero(Seconds);

        // If the count down is finished, write some text
        if (dist < 0) {
            clearInterval(y);
            document.getElementById("clock").innerHTML = "EXPIRED";
            return;
        }
    }, 1000);
}

//Stop//

//Start another//

//Add time//

