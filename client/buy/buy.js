////////// Helpers for in-place editing, from "todos" example //////////
FormGuy = {};
// Returns an event_map key for attaching "ok/cancel" events to a text input (given by selectors)
FormGuy.okcancel_events = function (selector) {
  var list;
  if (typeof selectors === 'string')
    list = [selector];
  else
    list = selector;

  var toEventMap = function (selector) {
    return 'keyup '+selector+', keydown '+selector+', focusout '+selector+', ';
  };

  var map = _.foldl(list, function (memo, selector) {return memo+toEventMap(selector);}, "");
  return map;
};
// Creates an event handler for interpreting "escape", "return", and "blur"
// on a text field and calling "ok" or "cancel" callbacks.
FormGuy.make_okcancel_handler = function (options) {
  var ok = options.ok || function () {};
  var cancel = options.cancel || function () {};

  return function (evt) {
    if (evt.type === "keydown" && evt.which === 27) {
      // escape = cancel
      cancel.call(this, evt);

    } else if (evt.type === "keyup" && evt.which === 13 ||
               evt.type === "focusout") {
      ok.call(this, evt.target, evt);
    }
  };
};

function isBuyQueryValid (query) {
  return query.where && query.checkin && query.checkout && query.rooms && query.guests;
};

Template.BuyNavbar.init = function () {
  initDatePicker('checkin', Clock.today());
  initDatePicker('checkout', Clock.tomorrow());
};

var eventSels = ['#where', '#checkin', '#checkout', '#rooms', '#guests'];
var eventMap = FormGuy.okcancel_events(eventSels);

Template.BuyNavbar.events = {};
Template.BuyNavbar.events[eventMap] = FormGuy.make_okcancel_handler({
  ok: function (input, evt) {
    var q = Session.get("BuyQuery");
    q[input.id] = input.value;
    Session.set("BuyQuery", q);

    if (!isBuyQueryValid(q)) {
      Session.set("BuySearchResults", []);
      return;
    }

    // Perform new buyer query, update search results
    var results = Availabilities.find({where: q["where"]}).fetch();
    Session.set("BuySearchResults", results);

    // Notify server of query to kick off query refresh
    Meteor.call("buyQuery", q["where"], function (error, result) {
      console.log("Server: buyQuery call complete");
      window.err = error;
      window.res = result;
      // TODO: Consider failure cases here
    });
  }
});

Template.buy.title = function () {
  var property = Properties.findOne({uuid: this.property});
  if (property)
    return property.title;

  return "";
};
Template.buy.phone = function () {
  var property = Properties.findOne({uuid: this.property});
  if (property)
    return property.phone;

  return "";
};
Template.buy.thumbURL = function () {
  var property = Properties.findOne({uuid: this.property});
  if (property && property.thumbURLs && property.thumbURLs.length)
    return property.thumbURLs[0];

  return "http://placehold.it/200x200";
};

Template.buy.results = function () {
  return Session.get("BuySearchResults");
};

// var dummyBuyResults = [
//   {
//     where: "Boston",
//     checkin: "07/07/2012",
//     checkout: "07/08/2012",
//     rooms: "1",
//     guests: "2",

//     property: "ccf7ef8c-0ca6-5ad1-9bbe-ae44a81a242a",
//     price: 123.12
//   },
//   {
//     where: "Boston",
//     checkin: "07/07/2012",
//     checkout: "07/08/2012",
//     rooms: "1",
//     guests: "2",

//     property: "9bde5855-7422-533e-b470-b072c611221c",
//     price: 321.32
//   },
//   {
//     where: "Boston",
//     checkin: "07/07/2012",
//     checkout: "07/08/2012",
//     rooms: "1",
//     guests: "2",

//     property: "acc1ed34-ee88-5746-a2c6-0ce0aed5bb99",
//     price: 777.77
//   }
// ];