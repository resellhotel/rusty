// Default routes
var RustyRouter = Backbone.Router.extend({
  routes: {
    "" : "home",
    "buy" : "buy",
    "sell" : "sell",
    "sell/listings" : "anonListing",
    "sell/listings/:listing_id" : "anonListing",
    "account" : "account",
    "account/listings" : "accountListings",
    "account/profile" : "accountProfile",
    "account/history" : "accountHistory",
    "admin" : "admin"
  },
  home: function () {
    Session.set("mode", "home");
    Session.set("view", "showHome");
  },
  buy: function () {
    Session.set("mode", "buy");
    Session.set("view", "showBuy");

    Meteor.setTimeout(function () {
      $('#dp-buy-checkin').datepicker({ format: 'mm-dd-yyyy'});
      $('#dp-buy-checkout').datepicker({ format: 'mm-dd-yyyy'});
    }, 1000);
  },
  sell: function () {
    Session.set("mode", "sell");
    Session.set("view", "showSell");
  },
  account: function () {
    Session.set("mode", "account");
    Session.set("view", "showAccount");
  },
  accountListings: function () {
    Session.set("mode", "account");
    Session.set("view", "showAccount");
    Session.set("accountNav", "listings");
    Session.set("accountView", "showListings");
  },
  accountHistory: function () {
    Session.set("mode", "account");
    Session.set("view", "showAccount");
    Session.set("accountNav", "history");
    Session.set("accountView", "showHistory");
  },
  accountProfile: function () {
    Session.set("mode", "account");
    Session.set("view", "showAccount");
    Session.set("accountNav", "profile");
    Session.set("accountView", "showProfile");
  },
  anonListing: function (listing_id) {
    Session.set("mode", "sell");

    if (listing_id) {
      Session.set("listing_id", listing_id);
      Session.set("view", "showAnonListing");

      // Initialize Datepickers, TODO: tie this to their template's generation
      Meteor.setTimeout(function () {
        $('#dp1').datepicker({ format: 'mm-dd-yyyy'});
        $('#dp2').datepicker({ format: 'mm-dd-yyyy'});
      }, 1000);
      return;
    }

    var id = Session.equals("listing_id", null) ? AnonListings.insert({}) : Session.get("listing_id");
    this.navigate("/sell/listings/"+id, true);
  },
  admin: function () {
    Session.set("mode", "admin");
    Session.set("view", "showAdmin");
  }
});
Router = new RustyRouter;
