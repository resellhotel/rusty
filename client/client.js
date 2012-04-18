// Main Minimongo Collections
Sections = new Meteor.Collection("sections");

Meteor.subscribe('lists', function () {
  return;
});

// The current section of the website.
Session.set('section', "home");

Template.content.section_is = function (section) {
  return Session.equals("section", section);
};

Template.navbar.sections = function () {
  return Sections.find();
}

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
    "sell" : "sell", "buy" : "buy"
  },
  sell: function () {
    Session.set("section", "sell");
  },
  buy: function () {
    Session.set("section", "buy");
  }
});

Router = new RustyRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});