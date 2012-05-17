// Default Application View State
Session.set('mode', "home");
Session.set('view', "showHome");

// Default Application Logic State
Session.set('userID', null);
// TODO: Is this still needed?
Session.set('listingDraftID', Meteor.call('createListing', {}));
Session.set('BuyQuery', {
  rooms: 1,
  guests: 1
});

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
  logVisitor();
});

// Common Application Logic
App = {
  isLoggedIn: function () {
    return !Session.equals("userID", null);
  },
  userEmail: function () {
    if (!App.isLoggedIn())
      return null;

    return Users.findOne({ _id: Session.get('userID')}).email;
  },
  listingDraft: function () {
    var id = Session.get('listingDraftID');
    return Listings.findOne({_id: id});
  },
  ensureLogin: function (fn) {
    if (this.isLoggedIn()) {
      fn && fn();
      return;
    }
    Session.get("LoginModal").prompt(fn, "You must be logged in first.", "info");
  },
  login: function(email, password, fn) {
    var user = Users.findOne({email: email});

    if (user) {
      Session.set("userID", user._id);
      Session.get("LoginModal").dismiss();
      fn();
    } else {
      Session.get("LoginModal").warn("No user found with that email.");
    }
  },
  logout: function() {
    Session.set("userID", null);
  },
  uploadListing: function() {
    var fn = function () {
      var userID = Session.get('userID');
      var listingID = Session.equals("mode", "sell") ? Session.get('listingDraftID') : Session.get('listingID');
      Meteor.call('addListing', userID, listingID, function (err, o) {
        if (err) {
          alert("An error occurred while uploading the listing. Please try again.");
          console.log(err);
          return;
        }
        Router.navigate("/account/listings", true);
        Session.set('listingDraftID', null);
      });
    };

    this.ensureLogin(fn);
  }
};

Admin = {
  clearListings: function () {
    Listings.remove({});
  }
};

function logVisitor() {
  var screenX = window.screen.width;
  var screenY = window.screen.height;
  Visitors.insert({ua: window.navigator.userAgent, screenWidth: screenX, screenHeight: screenY});
}
