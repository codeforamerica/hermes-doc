var CASES = {
  '13-F-010292': {
    defendantName: 'Kenisha Woods',
    courtDate: 'April 15, 2013',
    courtTime: '1pm',
  },
  '13-M-012391': {
    defendantName: 'Markell Blackburn',
    courtDate: 'April 22, 2013',
    courtTime: '1pm',
  },
  '12-M-011295': {
    invalidCase: true,
  },
  '13-F-002321': {
    defendantName: 'Teeinya Clavey',
    courtDate: 'May 3, 2013',
    courtTime: '9am',
    courtDateNotSetYet: true,
  },
  '13-F-020281': {
    defendantName: 'Tyrone Hornbeak',
    courtDate: 'May 10, 2013',
    courtTime: '9am',
    courtCaseNotInTheSystemYetNew: true
  },
  '12-F-108261': {
    defendantName: 'Misty Donaubuer',
    courtDate: 'May 12, 2013',
    courtTime: '1pm',
    courtCaseNotInTheSystemYetOld: true
  },
};

var TEXT_MESSAGE_DELAY_MIN = 750;
var TEXT_MESSAGE_DELAY_MAX = 2000;

var CASE_NUMBER_NO_WIDTH = 6;
var CASE_NUMBER_REGEXP = /(\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/;

var STATES = {
  // Initial state, ready for user input
  'ready': {
    cheatText: "<p>Imagine you’re seeing this poster, and holding your phone in your hand. What would you do?</p><img src='../ux/mocks/physical/business-card.png'><p>Example case numbers:</p><ul><li>13-F-010292<li>13-M-012391<li>12-M-011295 (expunged case)<li>13-F-002321 (no court date set yet)<li>13-F-020281 (case not in the system yet; case number is higher than the highest known case number)<li>12-F-108261 (case not in the system yet; case number looks old)<li>12-F-999999 (case doesn’t exist and never will)</ul>",

    onEntry: function() {
      data.waitingForReminders = false;
    }
  },

  'new-case-number': {
    onEntry: function() {
      if (data.waitingForReminders) {
        changeState('switch-to-another-case');
      } else {
        changeState('look-up-case');
      }      
    }
  },

  'look-up-case': {
    onEntry: function() {
      if (!validCaseNumber(data.prospectiveCaseNumberVerbatim)) {
        changeState('invalid-case-number');
      } else {
        data.prospectiveCaseNumber = 
            normalizeCaseNumber(data.prospectiveCaseNumberVerbatim);

        if (!CASES[data.prospectiveCaseNumber]) {
          changeState('case-not-in-the-system-yet-new-never-appear');
        } else if (CASES[data.prospectiveCaseNumber].invalidCase) {
          changeState('invalid-case');
        } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetNew) {
          changeState('case-not-in-the-system-yet-new');
        } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetOld) {
          changeState('case-not-in-the-system-yet-old');
        } else {
          data.prospectiveDefendantName = 
              CASES[data.prospectiveCaseNumber].defendantName;
          changeState('verify-case');
        }
      }
    }
  },

  'switch-to-another-case': {
    onEntry: function() {
      data.prospectiveCaseNumber = 
          normalizeCaseNumber(data.prospectiveCaseNumberVerbatim);

      if (data.prospectiveCaseNumber == data.caseNumber) {
        changeState('case-confirmed');
      } else if (!CASES[data.prospectiveCaseNumber]) {
        changeState('verify-another-case-not-in-the-system');
      } else if (CASES[data.prospectiveCaseNumber].invalidCase) {
        changeState('verify-another-case-not-in-the-system');
      } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetNew) {
        changeState('verify-another-case-not-in-the-system');
      } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetOld) {
        changeState('verify-another-case-not-in-the-system');
      } else {
        data.prospectiveDefendantName = 
            CASES[data.prospectiveCaseNumber].defendantName;
        changeState('verify-another-case');
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
      sendReply('We’re sorry, but we can’t send you a reminder about this case. Please make sure the case number is correct, or call {{clerkPhone}}.');
      changeState('ready');
    }
  },

  'verify-case': {
    onEntry: function() {
      sendReply('This case is about {{prospectiveDefendantName}}. Is this the case you want us to remind you about? Text YES or NO.');
      changeState('verify-case-logic');
    },
  },

  'verify-case-later': {
    onEntry: function() {
      sendReply('We now have more info. This case is about {{prospectiveDefendantName}}. Is this the case you want us to remind you about? Text YES or NO.');
      changeState('verify-case-logic');
    },
  },

  'verify-case-logic': {
    onTextMessage: function(input) {
      switch (input) {
        case 'Y':
        case 'YES':
        case 'YEAH':
        case 'YEP':
          if (CASES[data.prospectiveCaseNumber].courtDateNotSetYet) {
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
        default:
          changeState('404');
          break;
      }
    }
  },

  'verify-another-case': {
    onEntry: function() {
      sendReply('You are already getting reminders about another court case, {{caseNumber}} (about {{defendantName}}). You can’t get reminders about more than one court case.');
      sendReply('Respond YES if you want to get reminders about the new court case (about {{prospectiveDefendantName}}) instead.');
    },
    onTextMessage: function(input) {
      switch (input) {
        case 'Y':
        case 'YES':
        case 'YEAH':
        case 'YEP':
          if (CASES[data.prospectiveCaseNumber].courtDateNotSetYet) {
            changeState('case-confirmed-no-court-date');
          } else {
            changeState('case-confirmed');
          }
          break;
        case 'N':
        case 'NO':
        case 'NOPE':
          changeState('another-case-not-confirmed');
          break;
        default:
          changeState('404');
          break;
      }
    }
  },  

  'verify-another-case-not-in-the-system': {
    onEntry: function() {
      sendReply('You are already getting reminders about another court case, {{caseNumber}} (about {{defendantName}}). You can’t get reminders about more than one court case.');
      sendReply('Respond YES if you want to get reminders about the new court case ({{prospectiveCaseNumber}}) instead.');
    },
    onTextMessage: function(input) {
      switch (input) {
        case 'Y':
        case 'YES':
        case 'YEAH':
        case 'YEP':
          if (!CASES[data.prospectiveCaseNumber]) {
            changeState('case-not-in-the-system-yet-new-never-appear');
          } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetNew) {
            changeState('case-not-in-the-system-yet-new');
          } else if (CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetOld) {
            changeState('case-not-in-the-system-yet-old');
          } else if (CASES[data.prospectiveCaseNumber].invalidCase) {
            changeState('invalid-case');
          }
          break;
        case 'N':
        case 'NO':
        case 'NOPE':
          changeState('another-case-not-confirmed');
          break;
        default:
          changeState('404');
          break;
      }
    }
  },  

  'case-confirmed': {
    onEntry: function() {
      data.caseNumber = data.prospectiveCaseNumber;
      data.defendantName = data.prospectiveDefendantName;
      data.courtTime = CASES[data.caseNumber].courtTime;
      data.courtDate = CASES[data.caseNumber].courtDate;

      data.suspendedCaseNumber = null;      

      sendReply('You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
      changeState('waiting-for-reminders');
    }
  },

  'case-confirmed-no-court-date': {
    cheatActions: [
      { name: 'Fast forward time to when the date is set', state: 'case-confirmed-court-date-now-available' }
    ],
    onEntry: function() {
      data.caseNumber = data.prospectiveCaseNumber;
      data.defendantName = data.prospectiveDefendantName;

      sendReply('We don’t have a court date assigned to this case yet. Please wait and we will text you the court date whenever it becomes available.');
    }
  },

  'case-not-in-the-system-yet-new': {
    cheatActions: [
      { name: 'Fast forward time to when the case is in the system', state: 'courtnet-updated' }
    ],
    onEntry: function() {
      sendReply('Case {{prospectiveCaseNumber}} doesn’t exist yet. Make sure the case number is correct. Yes? Wait for more info. No? Text a different case number, or call {{clerkPhone}}.');
    }    
  },

  'case-not-in-the-system-yet-new-never-appear': {
    onEntry: function() {
      sendReply('Case {{prospectiveCaseNumber}} doesn’t exist yet. Make sure the case number is correct. Yes? Wait for more info. No? Text a different case number, or call {{clerkPhone}}.');
    }    
  },

  'case-not-in-the-system-yet-old': {
    cheatActions: [
      { name: 'Fast forward time to when the case is in the system', state: 'courtnet-updated' }
    ],
    onEntry: function() {
      sendReply('Case {{prospectiveCaseNumber}} doesn’t exist. Make sure the case number is correct. No? Text a different case number, or call {{clerkPhone}}. Yes? Wait for more info.');
    }    
  },

  'courtnet-updated': {
    onEntry: function() {
      CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetNew = false;
      CASES[data.prospectiveCaseNumber].courtCaseNotInTheSystemYetOld = false;

      data.prospectiveDefendantName = 
              CASES[data.prospectiveCaseNumber].defendantName;

      advanceTime('Later');
      changeState('verify-case-later');
    }
  },

  'case-confirmed-court-date-now-available': {
    onEntry: function() {
      advanceTime('Later');

      data.courtTime = CASES[data.caseNumber].courtTime;
      data.courtDate = CASES[data.caseNumber].courtDate;

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

  'another-case-not-confirmed': {
    onEntry: function() {
      sendReply('We won’t remind you about the new case. We will still remind you about the old case (about {{defendantName}}).');

      changeState('waiting-for-reminders');
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
  },
  'unsubscribe': {
    onEntry: function() {
      if (data.waitingForReminders) {
        sendReply('We won’t send you any more reminders. If you change your mind, text RESUME or another case number at any time.');
        data.suspendedCaseNumber = data.caseNumber;
        changeState('ready');
      } else {
        sendReply('You can’t text this number. Please call {{clerkPhone}} for more information about your court date.');
        changeToPreviousState();
      }
    }
  },
  'resubscribe': {
    onEntry: function() {
      if (data.suspendedCaseNumber) {
        data.prosectiveCaseNumberVerbatim = data.suspendedCaseNumber;
        changeState('look-up-case');
      } else {
        sendReply('You can’t text this number. Please call {{clerkPhone}} for more information about your court date.');
        changeToPreviousState();
      }
    }
  },
  '404': {
    onEntry: function() {
      sendReply('You can’t text this number. Please call {{clerkPhone}} for more information about your court date.');
      changeToPreviousState();
    }
  }
};

function handleGlobalInput(text) {
  var handled = true;

  if (validCaseNumber(text)) {
    data.prospectiveCaseNumberVerbatim = text;
    changeState('new-case-number');
  } else {
    switch (text) {
      case 'STOP':
        changeState('unsubscribe');
        break;
      case 'RESUME':
        changeState('resubscribe');
        break;

      /*case 'HELP':
      case '?':
        if (data.waitingForReminders) {
          changeState('help-waiting');
        } else {
          changeState('help-not-waiting');        
        }
        break;*/
      default:
        handled = false;
        break;
    }
  }
  return handled;
}

function normalizeCaseNumber(caseNumberVerbatim) {
  var caseNumberMatch = caseNumberVerbatim.match(CASE_NUMBER_REGEXP);

  var caseNumberSplit = {};
  caseNumberSplit.year = parseInt(caseNumberMatch[1]);
  caseNumberSplit.type = caseNumberMatch[2];
  caseNumberSplit.number = '' + parseInt(caseNumberMatch[3]);
  caseNumberSplit.codefendant = parseInt(caseNumberMatch[4]);

  while (caseNumberSplit.number.length < CASE_NUMBER_NO_WIDTH) {
    caseNumberSplit.number = '0' + caseNumberSplit.number;
  }

  return caseNumberSplit.year + '-' + 
      caseNumberSplit.type + '-' + caseNumberSplit.number;  
}

function validCaseNumber(caseNumber) {
  return caseNumber.match(CASE_NUMBER_REGEXP);
}