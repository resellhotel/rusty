AnonListings = new Meteor.Collection("anonListings");
Meteor.subscribe('anonListings');

// The current section of the website.
Session.set('current_nav', "home");
Session.set('current_mode', "showHome");
Session.set('listing_id', null);
Session.set('username', null);

var modes = ["showHome", "showSell", "showBuy", "showAnonListing", "showAccount"];
Template.content.mode_is = function (mode) {
  return Session.equals("current_mode", mode);
};

var RustyRouter = Backbone.Router.extend({
  routes: {
    "" : "home",
    "buy" : "buy",
    "sell" : "sell",
    "sell/listings" : "anonListing",
    "sell/listings/:listing_id" : "anonListing",
    "account" : "account"
  },
  home: function () {
    Session.set("current_nav", "home");
    Session.set("current_mode", "showHome");
  },
  buy: function () {
    Session.set("current_nav", "buy");
    Session.set("current_mode", "showBuy");
  },
  sell: function () {
    Session.set("current_nav", "sell");
    Session.set("current_mode", "showSell");
  },
  account: function () {
    Session.set("current_nav", "account");
    Session.set("current_mode", "showAccount");
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
  }
});

Router = new RustyRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});