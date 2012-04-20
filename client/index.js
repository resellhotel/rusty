AnonListings = new Meteor.Collection("anonListings");
Meteor.subscribe('anonListings');

// The current section of the website.
Session.set('current_nav', "home");
Session.set('current_mode', "showHome");
Session.set('listing_id', null);

var modes = ["showHome", "showSell", "showBuy", "showAnonListing"];
Template.content.mode_is = function (mode) {
  return Session.equals("current_mode", mode);
};

// Template.hello.greeting = function () {
//   return "Welcome to rusty.";
// };

// Template.hello.events = {
//   'click input' : function () {
//     // template data, if any, is available in 'this'
//     if (typeof console !== 'undefined')
//       console.log("You pressed the button");
//   }
// };

var RustyRouter = Backbone.Router.extend({
  routes: {
    "" : "home",
    "buy" : "buy",
    "sell" : "sell",
    "sell/listings" : "anonListing",
    "sell/listings/:listing_id" : "anonListing"
  },
  home: function () {
    Session.set("current_nav", "home");
    Session.set("current_mode", "showHome");
  },
  sell: function () {
    Session.set("current_nav", "sell");
    Session.set("current_mode", "showSell");
  },
  anonListing: function (listing_id) {
    Session.set("current_nav", "sell");

    if (listing_id) {
      Session.set("listing_id", listing_id);
      Session.set("current_mode", "showAnonListing");
      return;
    }

    var id;
    if (Session.equals("listing_id", null))
      id = AnonListings.insert({});
    else
      id = Session.get("listing_id");

    this.navigate("/sell/listings/"+id, true);
  },
  buy: function () {
    Session.set("current_nav", "buy");
    Session.set("current_mode", "showBuy");
  }
});

Router = new RustyRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});