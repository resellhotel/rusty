// Default routes
var RustyRouter = Backbone.Router.extend({
  routes: {
    "" : "home",
    "buy" : "buy",
    "sell" : "sell",
    "sell/listings" : "anonListing",
    "sell/listings/:anonListingID" : "anonListing",
    "account" : "account",
    "account/listings" : "accountListings",
    "account/profile" : "accountProfile",
    "account/history" : "accountHistory",
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
  accountListings: function () {
    Session.set("mode", "account");
    Session.set("view", "listings");
  },
  accountHistory: function () {
    Session.set("mode", "account");
    Session.set("view", "history");
  },
  accountProfile: function () {
    Session.set("mode", "account");
    Session.set("view", "profile");
  },
  anonListing: function (anonListingID) {
    Session.set("mode", "sell");
    Session.set("view", "listings");

    if (anonListingID) {
      Session.set("anonListingID", anonListingID);

      // Initialize Datepickers, TODO: tie this to their template's generation
      Meteor.setTimeout(function () {
        $('#dp1').datepicker({ format: 'mm-dd-yyyy'});
        $('#dp2').datepicker({ format: 'mm-dd-yyyy'});
      }, 1000);
      return;
    }

    var id = Session.equals("anonListingID", null) ? AnonListings.insert({}) : Session.get("anonListingID");
    this.navigate("/sell/listings/"+id, true);
  },
  admin: function () {
    Session.set("mode", "admin");
    Session.set("view", "visitors");
  }
});
Router = new RustyRouter;
