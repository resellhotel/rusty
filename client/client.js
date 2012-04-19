// The current section of the website.
Session.set('section', "Home");

Template.content.section_is = function (section) {
  return Session.equals("section", section);
};

Template.navbar.sections = [{name: "Home"}, {name: "Sell"}, {name: "Buy"}];

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
    "Sell" : "sell", "Buy" : "buy"
  },
  sell: function () {
    Session.set("section", "Sell");
  },
  buy: function () {
    Session.set("section", "Buy");
  }
});

Router = new RustyRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});