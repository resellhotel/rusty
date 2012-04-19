AnonListings = new Meteor.Collection("anonListings");
Meteor.subscribe('anonListings');

// The current section of the website.
Session.set('section', "Home");
Session.set('listing_id', null);

Template.content.section_is = function (section) {
  return Session.equals("section", section);
};

Template.navbar.sections = [{name: "Sell"}, {name: "Buy"}];

Template.navbar_item.active = function () {
  return Session.equals('section', this.name) ? 'active' : '';
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
    "Sell" : "sell",
    "Buy" : "buy",
    "Sell/listings" : "anonListing",
    "Sell/listings/:listing_id" : "anonListing"
  },
  sell: function () {
    Session.set("section", "Sell");
  },
  anonListing: function (listing_id) {
    Session.set("section", "Sell");

    if (listing_id) {
      Session.set("listing_id", listing_id);
      // Session.set("current_mode", "anon_listing");
      return;
    }

    var id;
    if (Session.equals("listing_id", null))
      id = AnonListings.insert({});
    else
      id = Session.get("listing_id");

    this.navigate("/Sell/listings/"+id, true);
  },
  buy: function () {
    Session.set("section", "Buy");
  }
});

Router = new RustyRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});