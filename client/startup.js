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
  login: function(email, password) {
    var userID;

    // HACK: If user doesn't exist, just create them
    if (Users.find({email: email}).count() == 0) {
      var user = {email: email, password: password};
      Meteor.call('createUser', user, function (err, id) {
        if (!err) {
          Session.set("userID", id);
          App.dismissLogin();
        } else {
          alert("A login error occurred. Please try again.");
          console.log(err);
        }
      });
    } else {
      userID = Users.findOne({email: email})._id;
      Session.set("userID", userID);
      App.dismissLogin();
    }
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
  uploadListing: function() {
    // Prompt the user to login first if they're not
    if (!App.isLoggedIn()) {
      var msg = "Please login (or signup) first, thanks!";
      App.promptLogin(msg);
      return;
    }

    // Add listing to the user
    var userID = Session.get('userID');
    var listingID = Session.equals("mode", "sell") ? Session.get('listingDraftID') : Session.get('listingID');
    Meteor.call('addListing', userID, listingID, function (err, o){
      if (err) {
        alert("An error occurred while uploading the listing. Please try again.");
        console.log(err);
        return;
      }
      Router.navigate("/account/listings", true);
      Session.set('listingDraftID', null);
    });
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
