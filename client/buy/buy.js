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
FormGuy.make_onchange_handler = function (options) {
  var change = options.change || function () {};

  return function (evt) {
    alert("change happened");
    change.call(this, evt.target, evt);
  };
};





Template.BuyNavbar.subnavs = function () {
  var subnavs = [];
  subnavs =[{type: "input", id: "where", name: "Where"},
            {type: "date", id: "checkin", name: "Checkin"},
            {type: "date", id: "checkout", name: "Checkout"},
            {type: "select", id: "rooms", options: [{name:"1 room"}, {name:"2 rooms"}, {name:"3 rooms"}, {name:"4 rooms"}] },
            {type: "select", id: "guests", options: [{name:"1 guest"}, {name:"2 guests"}, {name:"3 guests"}, {name:"4 guests"}] }
  ];
  return subnavs;
};

Template.BuyNavbarItem.type_is = function (type) {
  return this.type == type;
};

function isBuyQueryValid (query) {
  return query.where && query.checkin && query.checkout && query.rooms && query.guests;
};

var eventSels = ['#where', '#checkin', '#checkout', '#rooms', '#guests'];
var eventMap = FormGuy.okcancel_events(eventSels);

Template.BuyNavbarItem.events = {};
Template.BuyNavbarItem.events[eventMap] = FormGuy.make_okcancel_handler({
  ok: function (input, evt) {
    var q = Session.get("BuyQuery");
    q[input.id] = input.value;
    Session.set("BuyQuery", q);

    if (isBuyQueryValid(q)) {
      // Perform new buyer query, update search results
      console.log("buyer query IS valid");
    } else {
      console.log("buyer query IS NOT valid");
    }
  }
});
