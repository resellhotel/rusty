// Default session data
Session.set('mode', "home");
Session.set('accountMode', 'listings');
Session.set('view', "showHome");
Session.set("accountNav", "listings");
Session.set("accountView", "showListings");

// User data
Session.set('userID', null);

// Seller upload tool state
Session.set('anonListingID', null);

// Common Application Logic
App = {
  isLoggedIn: function () {
    return !Session.equals("userID", null);
  },
  userID: function () {
    return Session.get("userID");
  },
  login: function(userID, userPassword) {
    // TODO: Add in real auth.
    if (Users.find({id: userID}).count() == 0) {
      Users.insert({id: userID, password: userPassword});
    }

    // Update the session state
    Session.set("userID", userID);
    console.log("password: "+userPassword);

    App.dismissLogin();
  },
  logout: function() {
    Session.set("userID", null);
  },
  promptLogin: function (message) {
    alert(message);
    $("#loginModal").modal('show');
  },
  dismissLogin: function () {
    $("#loginModal").modal('hide');
  },
  attachListingToUser: function(callback) {
    if (App.isLoggedIn()) {
      var listingID = Session.get('anonListingID');
      var listing = AnonListings.findOne({id: listingID});

      var userID = Session.get('userID');
      Users.update({id: userID}, {listings: {$addToSet: listing}}, callback);
      // TODO: Put up a spiny while the update finishes.
    } else {
      App.promptLogin("You'll need to login (or create an account) first before you can upload a reservation.");
    }
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
