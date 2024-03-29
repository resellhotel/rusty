window.googAPI_key = "AIzaSyAFpxh8N-tWOZQIcL8DzKB8MoY8hmNA5bQ";

// Default Application View State
Session.set('mode', "home");
Session.set('view', "showHome");

// Default Application Logic State
Session.set('userID', null);
Session.set('loginMode', "loading");
// TODO: Is this still needed?
Session.set('listingDraftID', Meteor.call('createListing', {}));
Session.set("BuyHasSearchResults", false);

Meteor.startup(function () {
  Backbone.history.start({pushState: true});

  Session.set('BuyQuery', {
    checkin: Clock.today(),
    checkout: Clock.tomorrow(),
    rooms: 1,
    guests: 1
  });

  initFacebookAPI();
  // logVisitor();

  // Pull in Admin Debug Settings
  // Session.set("DebugEnabled", false);
  // Meteor.setTimeout(function () {
  //   var debugSettings = AdminSettings.findOne({name: "debug"});
  //   if (debugSettings) {
  //     Session.set("DebugEnabled", debugSettings["enabled"]);
  //     console.log("Loaded Debug Settings");
  //   }
  // }, 500);
});

var testXml2JsnParser = function () {
  // Algo API Tests
  var algoTests = ["algoTestHotelInfo", "algoFetchRefStates", "algoFetchRefCitiesByState"];
  var testToCall = 0;
  console.log("Calling " + algoTests[testToCall]);
  Meteor.call(algoTests[testToCall], function (status, result) {

    window.result = result;
    // window.parsedResult = parseHotelInfo(result);

    console.log("Finished calling " + algoTests[testToCall] + ", test result values: window.result/parsedResult");
  });
};

// Common Application Logic
App = {
  isLoggedIn: function () {
    return Session.equals("loggedIn", true);
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
    Session.set("loggedIn", false);
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
