const ws = new WebSocket('ws://localhost:3002');

var name='Jane Doe';
var first = 0;

ws.onopen = function() {
  console.log('connection established');
};

ws.onmessage = function(event) {
  const li = document.createElement('li');
  li.textContent = event.data;
  const ul = document.getElementById('message-container');
  ul.appendChild(li);
}

const form = document.getElementById('chat');
form.addEventListener('submit', function(event) {
  const textInput = document.getElementById('chat-message');
  const chatText = name + ": " + textInput.value;
  if(first==0){
    name=textInput.value;
    first=1;
  }
  textInput.value = '';
  ws.send(chatText);
  event.preventDefault();
});