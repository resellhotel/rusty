// Default session data
Session.set('listing_id', null);
Session.set('username', null);
Session.set('loginNav', "login");

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
    Session.set("current_nav", "home");
    Session.set("current_mode", "showHome");
  },
  buy: function () {
    Session.set("current_nav", "buy");
    Session.set("current_mode", "showBuy");

    Meteor.setTimeout(function () {
      $('#dp-buy-checkin').datepicker({ format: 'mm-dd-yyyy'});
      $('#dp-buy-checkout').datepicker({ format: 'mm-dd-yyyy'});
    }, 1000);
  },
  sell: function () {
    Session.set("current_nav", "sell");
    Session.set("current_mode", "showSell");
  },
  account: function () {
    Session.set("current_nav", "account");
    Session.set("current_mode", "showAccount");
  },
  accountListings: function () {
    Session.set("current_nav", "account");
    Session.set("current_mode", "showAccount");
    Session.set("accountNav", "listings");
    Session.set("accountView", "showListings");
  },
  accountHistory: function () {
    Session.set("current_nav", "account");
    Session.set("current_mode", "showAccount");
    Session.set("accountNav", "history");
    Session.set("accountView", "showHistory");
  },
  accountProfile: function () {
    Session.set("current_nav", "account");
    Session.set("current_mode", "showAccount");
    Session.set("accountNav", "profile");
    Session.set("accountView", "showProfile");
  },
  anonListing: function (listing_id) {
    Session.set("current_nav", "sell");

    if (listing_id) {
      Session.set("listing_id", listing_id);
      Session.set("current_mode", "showAnonListing");

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
    Session.set("current_nav", "admin");
    Session.set("current_mode", "showAdmin");
  }
});
Router = new RustyRouter;
