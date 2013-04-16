var STATES = {
  'ready': {
    onEntry: function() {
      sendReply('Welcome.');
      sendReply('Welcome.');
      sendReply('Welcome.');
    },  
    onTextMessage: function(input) {
      changeState('confirmation');
    }
  },
  'confirmation': {
    onEntry: function() {
      sendReply('Confirmed!');
    }
  }
}