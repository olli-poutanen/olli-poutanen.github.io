

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  map1.invalidateSize();
  evt.currentTarget.className += " active";
}

function unhideTablink(className) {
  hiddenLinks = document.getElementsByClassName(className);
  for (i = 0; i < hiddenLinks.length; i++) {
    hiddenLinks[i].style.display = "inline";
  }
}

function hideTablink(className) {
  hiddenLinks = document.getElementsByClassName(className);
  for (i = 0; i < hiddenLinks.length; i++) {
    hiddenLinks[i].style.display = "none";
  }
}

function logOut(){

  //Unneeded if just refreshed
  //hideTablink('hidden-first')
  //unhideTablink('show-first')
  //document.getElementById('newgamebutton').click();
  //document.getElementById("title").innerHTML="";
  
  //Deletes cookie -> is it ok?
  document.cookie = "game=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  location.reload();
}