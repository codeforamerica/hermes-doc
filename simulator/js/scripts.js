var state;

function enterState(newState) {
  var state = newState;

  if (STATES[state].onEntry) {
    STATES[state].onEntry();
  }
}

function sendReply(text) {
  var el = document.createElement('div');
  el.classList.add('reply');
  el.innerHTML = '<span>' + text + '</span>';

  document.querySelector('#content').appendChild(el);
  document.querySelector('#content').scrollTop = 99999999;
}

function sendTextMessage(text) {
  var el = document.createElement('div');
  el.classList.add('text-message');
  el.innerHTML = '<span>' + text + '</span>';

  document.querySelector('#content').appendChild(el);
  document.querySelector('#content').scrollTop = 99999999;
}

function onInputKeyDown(event) {
  if (event.keyCode == 13) {
    sendTextMessage(document.querySelector('#input').value);

    document.querySelector('#input').value = '';
  }
}

function main() {
  document.querySelector('#input').addEventListener('keydown', onInputKeyDown, false);

  enterState('ready');

}