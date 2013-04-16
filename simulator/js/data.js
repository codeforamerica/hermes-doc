var CASES = {
  '13-F-0102292': {
    defendantName: 'Kenisha Woods'
  }
};

var STATES = {

  // Initial state, ready for user input
  'ready': {
    cheatText: "<p>Imagine you’re seeing this poster, and holding your phone in your hand. What would you do?</p><img src='../ux/mocks/physical/business-card.png'><p>Example case numbers: 13-F-0102292</p>",

    onEntry: function() {
      //sendReply('Thank you. You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
      //sendReply('{{clerkPhone}}');
    },
    onTextMessage: function(input) {
      data.caseNumber = input;

      changeState('look-up-case');
    }
  },

  'look-up-case': {
    onEntry: function() {
      if (!CASES[data.caseNumber]) {
        changeState('invalid-case');
      } else {
        data.defendantName = CASES[data.caseNumber].defendantName;
        changeState('verify-case');
      }
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
        case 'y':
        case 'yes':
        case 'yeah':
        case 'yep':
          changeState('case-confirmed');
          break;
        case 'n':
        case 'no':
        case 'nope':
          changeState('case-not-confirmed');
          break;
      }
    }
  },

  'case-confirmed': {
    onEntry: function() {
      sendReply('Thank you. You need to come to court on {{courtDate}}, at {{courtTime}}. We will send you a reminder text message a day before your court date.');
    }
  },

  'case-not-confirmed' : {
    onEntry: function() {
      sendReply('We won’t remind you of this case. Please text another case number to us, or call {{clerkPhone}} for any information about court dates.');

      changeState('ready');
    }
  },
}