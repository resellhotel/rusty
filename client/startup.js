// Default session data
Session.set('mode', "home");
Session.set('accountMode', 'listings');
Session.set('view', "showHome");
Session.set("accountNav", "listings");
Session.set("accountView", "showListings");

Session.set('userID', null);
Session.set('anonListingID', null);

// Common Application Logic
App = {
  isLoggedIn: function () {
    !Session.equals("userID", null);
  },
  userID: function () {
    Session.get("userID");
  },
  promptLogin: function (message) {
    alert(message);
    $("#loginModal").modal('show');
  },
  attachListingToUser: function(listingID, userID) {
    var listing = AnonListings.findOne({id: listingID});
    Users.update({id: userID}, {listings: {$addToSet: listing}});
  }
};

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
