
      document.getElementById("Start").addEventListener("click", runner);
      
      var Hset = 0;
      var Mset = 0;
      var Sset = 3;
      var MainSet=0.005;

      //Global functions
      function leadingZero(n) {
        return n < 10 ? "0" + n : n;
      }

      function pausenow(orig, curr, t) {
        TimeLeft = orig;
        TimeLeft -= new Date() - curr;
        clearInterval(t);
      }

      function runner() {
        Starter(Sset);
      }

      function Starter() {
        document.getElementById("Start").removeEventListener("click", runner);

        // ####################################################
        function MainTimer(Tunti, first) {
        
        	var cntDownDate = new Date(new Date().getTime() + Tunti * 60 * 60 * 1000);
        
        	function Resume(){
          	document.getElementById("Start").removeEventListener("click", Resume);
            document.getElementById("3secs").removeEventListener("click", addMoreMins2);
          	document.getElementById("5mins").removeEventListener("click", addMoreMins2);
          	document.getElementById("15mins").removeEventListener("click", addMoreMins2);
          	myMainTimer = new MainTimer(timeLeft);
          }
          
          function Pause(){
         		clearInterval(y);
            timeLeft=(cntDownDate-new Date().getTime())/60/60/1000;
            document.getElementById("Start").removeEventListener("click", Pause);
            document.getElementById("Start").addEventListener("click", Resume);
          }
        
          var y = setInterval(function() {

            // Get today's date and time
            var nyt = new Date().getTime();

            // Find the distance between now and the count down date
            var dist = cntDownDate - nyt;

            // Time calculations for days, hours, minutes and seconds
            var Hs = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var Ms = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
            var Ss = Math.floor((dist % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            document.getElementById("demo").innerHTML = Hs + ":" + leadingZero(Ms) + ":" + leadingZero(Ss);

            // If the count down is finished, write some text
            if (dist < 0) {
              clearInterval(y);
              document.getElementById("demo").innerHTML = "EXPIRED";
              return;
            }
          }, 1000);
          

          
          function addMoreMins2() {
         
          	clearInterval(y);
            
            var SavedMain = (cntDownDate - new Date().getTime())/60/60/1000;
          
						document.getElementById("3secs").removeEventListener("click", addMoreMins2);
          	document.getElementById("5mins").removeEventListener("click", addMoreMins2);
          	document.getElementById("15mins").removeEventListener("click", addMoreMins2);
            document.getElementById("Start").removeEventListener("click", Pause);
           
          	myTimer=new Timer(this.getAttribute("data-mins")*60, SavedMain, 0);
          }

          document.getElementById("3secs").addEventListener("click", addMoreMins2);
          document.getElementById("5mins").addEventListener("click", addMoreMins2);
          document.getElementById("15mins").addEventListener("click", addMoreMins2); 
          document.getElementById("Start").addEventListener("click", Pause); 
        }

        // ####################################################

        function Timer(secs, Main, first) {
          
          Paused=0;
          
          function updateTimer(t, countDownDate, Mainval, first) {
            // Get todays date and time
            var now = new Date().getTime();
            // Find the distance between now an the count down date
            var diff = countDownDate.getTime() - now;
            // Time calculations for days, hours, minutes and seconds
            var hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
            var minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
            var seconds = Math.floor(diff % (1000 * 60) / 1000);

            var dateString = leadingZero(hours) + ":" + leadingZero(minutes) + ":" +
              leadingZero(seconds);

            if (diff < 0) {
              clearInterval(t);
              document.getElementById("Start").removeEventListener("click", Pause);
              myMainTimer = new MainTimer(Mainval, first);
              return;
            }
            document.getElementById("count-down").innerHTML = dateString;
          }

          var toDate = new Date(new Date().getTime() + secs * 1000);
          
          function Resume(){
          	Paused=0;
          	document.getElementById("Start").removeEventListener("click", Resume);
          	myTimer=new Timer(timeLeft, Main, first);
          }
          
          function Pause(){
          	Paused = 1;
         		clearInterval(x);
            timeLeft=(toDate-new Date().getTime())/1000;
            document.getElementById("Start").removeEventListener("click", Pause);
            document.getElementById("Start").addEventListener("click", Resume);
          }
          
          this.addMins = function(numMins) {
          	if(Paused==1){
           		toDate.setTime(new Date().getTime()+timeLeft * 1000 + numMins * 60 * 1000);
              timeLeft+=numMins * 60;
            } else{
              toDate.setTime(toDate.getTime() + numMins * 60 * 1000);
            }  
            updateTimer(x, toDate, Main, first);
          };
          
          updateTimer(x,toDate, first);
          
          var x = setInterval(function() {
            updateTimer(x, toDate, Main, first);
          }, 1000);
          

          function addMoreMins1() {
         		myTimer.addMins(this.getAttribute("data-mins"));
          }

          if(first==1){
          
            document.getElementById("3secs").addEventListener("click", addMoreMins1);
            document.getElementById("5mins").addEventListener("click", addMoreMins1);
            document.getElementById("15mins").addEventListener("click", addMoreMins1);
            
           }
           
            document.getElementById("Start").addEventListener("click", Pause);
          
				
        }
        
        var myTimer = new Timer(Sset, MainSet, 1);

        document.getElementById("Start").addEventListener("click", function() {
          change();
        });

        document.getElementById("Start").textContent = "Pause";

        function change() {
          var elem = document.getElementById("Start");
          if (elem.textContent == "Pause") {
            elem.textContent = "Resume";
          } else elem.textContent = "Pause";
        }
      }



      