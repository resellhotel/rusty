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
    Session.set("mode", "buy");
    Session.set("view", "search");

    Meteor.setTimeout(function () {
      $('#dp-buy-checkin').datepicker({ format: 'mm-dd-yyyy'});
      $('#dp-buy-checkout').datepicker({ format: 'mm-dd-yyyy'});
    }, 1000);
  },
  sell: function () {
    Session.set("mode", "sell");
    Session.set("view", "instructions");
  },
  account: function () {
    Session.set("mode", "account");
    Session.set("view", "listings");
  },
  listings: function () {
    Session.set("mode", "account");
    Session.set("view", "listings");
  },
  showListing: function (id) {
    Session.set("mode", "account");
    Session.set("view", "listingDetail");
    Session.set('listingID', id);
  },
  history: function () {
    Session.set("mode", "account");
    Session.set("view", "history");
  },
  profile: function () {
    Session.set("mode", "account");
    Session.set("view", "profile");
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
      if (!err)
        Router.navigate("/sell/listings/"+id, true);
    });  
  },
  admin: function () {
    Session.set("mode", "admin");
    Session.set("view", "visitors");
  }
});
Router = new RustyRouter;
