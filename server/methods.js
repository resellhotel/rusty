// Server-side only methods

Meteor.methods({
  toggleDebug: function(password) {
    if (Session.equals("AdminPassword", password))
      AdminSettings.update({name: "debug"}, {$set: {enabled: true}});
  },
  emitMessage: function (msg) {
    console.log(msg);
  }
});