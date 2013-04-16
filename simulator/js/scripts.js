// state

var state;

var data = {
  'caseNumber': null,
  'defendantName': null,
  'courtDate': 'Friday, April 8',
  'courtTime': '1pm',
  'clerkPhone': '502-111-2222'
}

function enterState(newState) {
  state = newState;

  if (STATES[state].onEntry) {
    STATES[state].onEntry();
  }

  if (STATES[state].cheatText) {
    document.querySelector('#cheat-sheet').innerHTML = STATES[state].cheatText;
    document.querySelector('#cheat-sheet').classList.add('visible');
  } else {
    document.querySelector('#cheat-sheet').classList.remove('visible');
  }
}

function changeState(newState) {
  enterState(newState);
}

function normalizeInput(text) {
  var text = text.toUpperCase();
  return text;
}

function sendTextMessage(text) {
  showTextMessage(text);

  if (STATES[state].onTextMessage) {
    STATES[state].onTextMessage(normalizeInput(text));
  }
}

function sendReply(text) {
  showReply(text);
}

// visual

function showReply(text) {
  var text = interpolateVariables(text);

  var el = document.createElement('div');
  el.classList.add('reply');
  el.innerHTML = '<span>' + text + '</span>';

  document.querySelector('#content').appendChild(el);
  document.querySelector('#content').scrollTop = 99999999;
}

function interpolateVariables(text) {
  var text = text.replace(/{{(.*?)}}/g, function(match) {
    var name = match.substr(2).substr(0, match.length - 4);
    return data[name];
  });
  return text;
}

function showTextMessage(text) {
  var el = document.createElement('div');
  el.classList.add('text-message');
  el.innerHTML = '<span>' + text + '</span>';

  document.querySelector('#content').appendChild(el);
  document.querySelector('#content').scrollTop = 99999999;
}

// -------

function onInputKeyDown(event) {
  if (event.keyCode == 13) {
    var text = document.querySelector('#input').value;
    sendTextMessage(text);

    document.querySelector('#input').value = '';
  }
}

function main() {
  document.querySelector('#input').addEventListener('keydown', onInputKeyDown, false);

  enterState('ready');
}