// Default routes
var RustyRouter = Backbone.Router.extend({
  routes: {
    "" : "home",
    "buy" : "buy",
    "sell" : "sell",
    "sell/listings" : "listingDraft",
    "sell/listings/:id" : "listingDraft",
    "account" : "account",
    "account/listings/:id" : "showListing",
    "account/listings" : "listings",
    "account/profile" : "profile",
    "account/history" : "history",
    "admin" : "admin"
  },
  home: function () {
    Session.set("mode", "home");
    Session.set("view", "home");
  },
  buy: function () {
    if (!window.BuySearch)
      window.BuySearch = new BuySearchContext();

    Session.set("mode", "buy");
    Session.set("view", "search");

    // If in debug mode, kick off default search
    if (Session.equals("BuyHasSearchResults", false) && Session.equals("DebugEnabled", true)) {
      var query = {
        where: "Austin",
        checkin: "07/01/2012",
        checkout: "07/02/2012",
        guests: 1,
        rooms: 1
      };
      window.BuySearch.search(query);
    }
  },
  sell: function () {
    Session.set("mode", "sell");
    Session.set("view", "instructions");
  },
  account: function () {
    App.ensureLogin(function () {
      Session.set("mode", "account");
      Session.set("view", "listings");
    });
  },
  listings: function () {
    App.ensureLogin(function () {
      Session.set("mode", "account");
      Session.set("view", "listings");
    });
  },
  showListing: function (id) {
    App.ensureLogin(function () {
      Session.set("mode", "account");
      Session.set("view", "listingDetail");
      Session.set('listingID', id);
    });
  },
  history: function () {
    App.ensureLogin(function () {
      Session.set("mode", "account");
      Session.set("view", "history");
    });
  },
  profile: function () {
    App.ensureLogin(function () {
      Session.set("mode", "account");
      Session.set("view", "profile");
    });
  },
  listingDraft: function (id) {
    Session.set("mode", "sell");
    Session.set("view", "listings");

    // TODO: Check if this id actually maps to a real listing
    if (id) {
      Session.set("listingDraftID", id);
      return;
    }

    id = Session.get("listingDraftID");
    if (id) {
      this.navigate("/sell/listings/"+id, true);
      return;
    }

    Meteor.call('createListing', {}, function (err, id) {
      if (!err) {
        Meteor.flush();
        Router.navigate("/sell/listings/"+id, true);
      }
    });  
  },
  admin: function () {
    Session.set("mode", "admin");
    Session.set("view", "visitors");
  }
});
Router = new RustyRouter;
