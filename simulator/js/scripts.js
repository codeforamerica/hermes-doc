// state

var state;
var previousState;

var data = {
  'caseNumber': null,
  'caseNumberOriginal': null,
  'caseNumberSplit': null,
  'defendantName': null,
  'courtDate': 'Friday, April 8',
  'courtTime': '1pm',
  'clerkPhone': '502-111-2222',

  'newCaseNumberOriginal': null,
  'newCaseDefendantName': null,

  waitingForReminders: false
}

function enterState() {
  if (STATES[state].onEntry) {
    STATES[state].onEntry();
  }

  if (STATES[state].cheatText) {
    document.querySelector('#cheat-sheet').innerHTML = STATES[state].cheatText;
    document.querySelector('#cheat-sheet').classList.add('visible');
  } else {
    document.querySelector('#cheat-sheet').classList.remove('visible');
  }

  if (STATES[state].cheatActions) {
    if (!STATES[state].cheatText) {
      document.querySelector('#cheat-sheet').innerHTML = '';      
    } else {
      document.querySelector('#cheat-sheet').innerHTML += '<hr>';
    }

    document.querySelector('#cheat-sheet').innerHTML += '<p>Superpowers available at this point:</p>'

    for (var i in STATES[state].cheatActions) {
      var el = document.createElement('button');
      el.classList.add('cheat-action');
      el.innerHTML = STATES[state].cheatActions[i].name;
      el.setAttribute('state', STATES[state].cheatActions[i].state);
      el.addEventListener('click', onCheatActionClick);

      document.querySelector('#cheat-sheet').appendChild(el);
    }
    document.querySelector('#cheat-sheet').classList.add('visible');
  }
}

function onCheatActionClick(event) {
  changeState(event.target.getAttribute('state'));

  document.querySelector('#input').focus();
}

function changeState(newState) {
  previousState = state;
  state = newState;

  enterState();
}

function changeToPreviousState() {
  changeState(previousState);
}

function normalizeInput(text) {
  var text = text.toUpperCase();
  return text;
}

function onTextMessage(text) {
  showTextMessage(text);

  var text = normalizeInput(text);

  if (!handleGlobalInput(text)) {
    if (STATES[state].onTextMessage) {
      STATES[state].onTextMessage(text);
    }
  }
}

function sendReply(text) {
  window.setTimeout(function() {
    showReply(text);
  }, Math.random() * (TEXT_MESSAGE_DELAY_MAX - TEXT_MESSAGE_DELAY_MIN) + TEXT_MESSAGE_DELAY_MIN);
}

function advanceTime(text) {
  showTimestamp(text);
}

// visual

function appendToContent(el) {
  document.querySelector('#content').appendChild(el);
  document.querySelector('#content').scrollTop = 99999999; 
}

function showReply(text) {
  var text = interpolateVariables(text);

  var el = document.createElement('div');
  el.classList.add('reply');
  el.innerHTML = '<span>' + text + '</span>';

  appendToContent(el);
}

function showTimestamp(text) {

  var el = document.createElement('div');
  el.classList.add('timestamp');
  el.innerHTML = '<span>' + text + '</span>';

  appendToContent(el);
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

  appendToContent(el);
}

// -------

function onInputKeyDown(event) {
  if (event.keyCode == 13) {
    var text = document.querySelector('#input').value;
    onTextMessage(text);

    document.querySelector('#input').value = '';
  }
}

function main() {
  document.querySelector('#input').addEventListener('keydown', onInputKeyDown, false);

  changeState('ready');
}