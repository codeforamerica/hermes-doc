// state

var CHEAT_SHEET_DELAY = 2000;
var SCROLL_ANIMATE_TIME = 250;

var state;
var previousState;

var textMessageDelayMin;
var textMessageDelayMax;

var data = {
  'prospectiveCaseNumberVerbatim': null,
  'prospectiveCaseNumber': null, // normalized
  'prospectiveDefendantName': null,

  'caseNumber': null,
  'defendantName': null,
  'courtDate': null,
  'courtTime': null,
  
  'clerkPhone': '502-111-2222',

  waitingForReminders: false
}

function enterState() {
  document.querySelector('#cheat-sheet').classList.remove('visible');

  window.setTimeout(function() {
    if (STATES[state].onEntry) {
      STATES[state].onEntry();
    }
  
    showCheatSheet();
  }, Math.random() * (textMessageDelayMax - textMessageDelayMin) + textMessageDelayMin);
}

function showCheatSheet() {
  if (STATES[state].cheatText) {
    document.querySelector('#cheat-sheet').innerHTML = STATES[state].cheatText;
    document.querySelector('#cheat-sheet').classList.add('visible');
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

// “Silent” change – don’t do onEntry()
function changeToPreviousState() {
  state = previousState;
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
    } else {
      changeState('404');
    }
  }
}

function sendReply(text) {
  //window.setTimeout(function() {
    showReply(text);
  //}, Math.random() * (TEXT_MESSAGE_DELAY_MAX - TEXT_MESSAGE_DELAY_MIN) + TEXT_MESSAGE_DELAY_MIN);
}

function advanceTime(text) {
  showTimestamp(text);
}

// visual

function appendToContent(el) {
  document.querySelector('#content').appendChild(el);
  
  var el = document.querySelector('#content');
  $('#content').animate({scrollTop : el.scrollHeight - el.clientHeight}, SCROLL_ANIMATE_TIME);
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

function commitInput() {
  var text = document.querySelector('#input').value;
  onTextMessage(text);

  document.querySelector('#input').value = '';
  onInputInput();
}

function onInputKeyDown(event) {
  if ((event.keyCode == 13) && (!document.querySelector('#send').disabled)) {
    commitInput();
  }
}

function onInputInput(event) {
  document.querySelector('#send').disabled = 
      (document.querySelector('#input').value.length == 0);
}


function main() {
  if (location.href.indexOf('no-delay') != -1) {
    textMessageDelayMin = 0;
    textMessageDelayMax = 0;
  } else {
    textMessageDelayMin = TEXT_MESSAGE_DELAY_MIN;
    textMessageDelayMax = TEXT_MESSAGE_DELAY_MAX;
  }

  document.querySelector('#input').addEventListener('keydown', onInputKeyDown);
  document.querySelector('#input').addEventListener('input', onInputInput);

  document.querySelector('#send').addEventListener('click', commitInput);

  onInputInput();

  changeState('ready');
}