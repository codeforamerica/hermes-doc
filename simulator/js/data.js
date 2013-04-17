var CASES = {
  '13-F-010292': {
    defendantName: 'Kenisha Woods'
  },
  '13-M-012391': {
    defendantName: 'Markell Blackburn'
  },
  '13-F-002321': {
    defendantName: 'Teeinya Clavey',
    delayedCourtDate: true
  }
};

var TEXT_MESSAGE_DELAY_MIN = 750;
var TEXT_MESSAGE_DELAY_MAX = 2000;

var CASE_NUMBER_NO_WIDTH = 6;
var CASE_NUMBER_REGEXP = /(\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/;

var STATES = {
  // Initial state, ready for user input
  'ready': {
    cheatText: "<p>Imagine you’re seeing this poster, and holding your phone in your hand. What would you do?</p><img src='../ux/mocks/physical/business-card.png'><p>Example case numbers:</p><ul><li>13-F-010292<li>13-M-012391<li>13-F-002321 (no court date set yet)</ul>",

    onEntry: function() {
      data.waitingForReminders = false;
      //sendReply('Thank you. You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
      //advanceTime('tomorrow');
      //sendReply('{{clerkPhone}}');
    },
    onTextMessage: function(input) {
      data.caseNumberOriginal = input;

      changeState('look-up-case');
    }
  },

  'look-up-case': {
    onEntry: function() {
      if (!validCaseNumber(data.caseNumberOriginal)) {
        changeState('invalid-case-number');
      } else {
        var caseNumberSplit = data.caseNumberOriginal.match(CASE_NUMBER_REGEXP);

        data.caseNumberSplit = {};
        data.caseNumberSplit.year = parseInt(caseNumberSplit[1]); // year
        data.caseNumberSplit.type = caseNumberSplit[2];
        data.caseNumberSplit.number = '' + parseInt(caseNumberSplit[3]); // number
        data.caseNumberSplit.codefendant = parseInt(caseNumberSplit[4]); // co-def

        while (data.caseNumberSplit.number.length < CASE_NUMBER_NO_WIDTH) {
          data.caseNumberSplit.number = '0' + data.caseNumberSplit.number;
        }

        data.caseNumber = data.caseNumberSplit.year + '-' + data.caseNumberSplit.type + '-' + data.caseNumberSplit.number;

        //console.log(data.caseNumber);

        if (!CASES[data.caseNumber]) {
          changeState('invalid-case');
        } else {
          data.defendantName = CASES[data.caseNumber].defendantName;
          changeState('verify-case');
        }
      }
    }
  },

  'invalid-case-number': {
    onEntry: function() {
      sendReply('This doesn’t look like a case number. A case number looks like 13-M-012345. Look at your files or ask your defender for a case number, and text it back.');
      changeState('ready');
    }
  },

  'invalid-case': {
    onEntry: function() {
      sendReply('We’re sorry, but we can’t send you a reminder about this particular case. Please make sure this case number is correct, or call {{clerkPhone}}.');
      changeState('ready');
    }
  },

  'verify-case': {
    onEntry: function() {
      sendReply('Thank you. This case is about {{defendantName}}. Is this the case you want us to remind you about? Text YES or NO.');
    },
    onTextMessage: function(input) {
      switch (input) {
        case 'Y':
        case 'YES':
        case 'YEAH':
        case 'YEP':
          if (CASES[data.caseNumber].delayedCourtDate) {
            changeState('case-confirmed-no-court-date');
          } else {
            changeState('case-confirmed');
          }
          break;
        case 'N':
        case 'NO':
        case 'NOPE':
          changeState('case-not-confirmed');
          break;
      }
    }
  },

  'case-confirmed': {
    onEntry: function() {
      sendReply('Thank you. You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
      changeState('waiting-for-reminders');
    }
  },

  'case-confirmed-no-court-date': {
    cheatActions: [
      { name: 'Fast forward time to when the date is set', state: 'case-confirmed-court-date-now-available' }
    ],
    onEntry: function() {
      sendReply('We don’t have a court date assigned to this case yet. Please wait and we will text you the court date whenever it becomes available.');
    }
  },

  'case-confirmed-court-date-now-available': {
    onEntry: function() {
      advanceTime('Later');
      sendReply('We now have more info. You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
      changeState('waiting-for-reminders');
    }    
  },

  'waiting-for-reminders': {
    cheatActions: [
      { name: 'Fast forward time to 1 day before', state: 'waiting-for-reminders-1-day-before' }
    ],
    onEntry: function() {
      data.waitingForReminders = true;
    },
    onTextMessage: function() {
      sendReply('You can’t text this number. Please call {{clerkPhone}} for more information about your court date.');
    }
  },

  'waiting-for-reminders-1-day-before': {
    onEntry: function() {
      advanceTime('One day before the court date');
      sendReply('Your court date is tomorrow: {{courtDate}}, at {{courtTime}}, in the Hall of Justice. If you can’t make it, call {{clerkPhone}} as soon as possible, today.')

      data.waitingForReminders = true;
    },
    onTextMessage: function() {
      sendReply('You can’t text this number. Please call {{clerkPhone}} for more information about your court date.');
    }
  },

  'case-not-confirmed': {
    onEntry: function() {
      sendReply('We won’t remind you of this case. Please text another case number to us, or call {{clerkPhone}} for any information about court dates.');

      changeState('ready');
    }
  },

  'verify-switch-to-another-case': {
    onEntry: function() {
      sendReply('You are already getting reminders about another court case, {{caseNumber}} (about {{defendantName}}). You can’t get reminders about more than one court case.');
      sendReply('Respond YES if you are sure you want to get a text message reminder about the new court case (about {{newCaseDefendantName}}) instead.');
    }
  },

  // global/temporary states

  'help-waiting': {
    onEntry: function() {
      sendReply('Help waiting');
      changeToPreviousState();
    }
  },
  'help-not-waiting': {
    onEntry: function() {
      sendReply('Help not waiting');
      changeToPreviousState();
    }
  }
};

function handleGlobalInput(text) {
  var handled = true;

  if (validCaseNumber(text)) {
    if (data.waitingForReminders) {
      data.newCaseNumber = text;
      data.newCaseDefendantName = 'John McCain';
      changeState('verify-switch-to-another-case');
    } else {
      data.caseNumberOriginal = text;
      changeState('look-up-case');
    }
  } else {
    switch (text) {
      case 'HELP':
      case '?':
        if (data.waitingForReminders) {
          changeState('help-waiting');
        } else {
          changeState('help-not-waiting');        
        }
        break;
      default:
        handled = false;
        break;
    }
  }
  return handled;
}

function validCaseNumber(caseNumber) {
  return caseNumber.match(CASE_NUMBER_REGEXP);
}