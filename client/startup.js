// Default session data
Session.set('listing_id', null);
Session.set('username', null);
Session.set('loginNav', "login");
Session.set('current_nav', "home");
Session.set('current_mode', "showHome");

// Default client-side setup
Meteor.startup(function () {
  Backbone.history.start({pushState: true});
  logVisitor();
});

function logVisitor() {
  var screenX = window.screen.width;
  var screenY = window.screen.height;
  Visitors.insert({ua: window.navigator.userAgent, screenWidth: screenX, screenHeight: screenY});
}