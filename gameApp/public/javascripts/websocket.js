const ws = new WebSocket('ws://localhost:3002');

ws.onopen = function() {
  console.log('connection established');
};

/* Kuuntelee viestiä serveriltä ja tekee käyttäjille uuden rivin saatuaan viestin */
ws.onmessage = function(event) {
  const th = document.createElement('th');
  th.textContent = event.data;
  const tr = document.getElementById('player');
  tr.appendChild(th);
}

/* Lähettää viestin serverille */
const form = document.getElementById('gamedata');
form.addEventListener('submit', function(event) {
  const textInput = document.getElementById('player-name');
  const gameName = textInput.value;
  textInput.value = '';
  ws.send(gameName);
  event.preventDefault();
});