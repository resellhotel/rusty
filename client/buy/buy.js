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
  }
});
// Template.BuyNavbar.events['change #where'] = function ()
// {
//   // var input = this.value;
//   // var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
//   // Meteor.http.get(url+"?input="+input+"&sensor=false", function (err, result) {
//   //   if (err) console.log("error!");
//   //   window.acomp = result;
//   // });
//   var data = {
//     source: ["Boston", "New York", "Austin", "Boxford", "Acton"],
//     items: 7
//   };
//   console.log("happening");
//   // $('#where').typeahead(data);
// };
Template.BuyNavbar.events["click #SearchButton"] = function ()
{
  console.log("search!");
  var q = Session.get("BuyQuery");
  window.BuySearch.search(q);
};

BuySearchContext = function () 
{
  this.context = new Context(new SizeSet("*", "*"));
  this.MainContent = new Context(new SizeSet("*", "*"));
  this.context.add(this.MainContent, new Area(0, 0, [0, 1], [0, 1]));

  this.MapContext = new Context(new SizeSet("*", "*"));
  this.MainContent.add(this.MapContext, new Area(0, 0, [0, .6], [0, 1]));

  this.ThumbListContext = new Context(new SizeSet("*", "*"));
  this.ThumbListContext.isScrollable = true;
  this.MainContent.add(this.ThumbListContext, new Area([0, .6], 0, [0, .4], [0, 1]));
};
BuySearchContext.prototype.search = function (q)
{
  // Get results (TODO: merge these both into a server call to get current results and updated results)
  var results = Availabilities.find({where: q["where"]}).fetch();
  // Meteor.call("buyQuery", q["where"], function (error, result) {
  //   console.log("Server: buyQuery call complete");
  //   window.err = error;
  //   window.res = result;
  //   // TODO: Consider failure cases here
  // });

  // Set the map for the results
  // TODO: look up lat/lng for q["where"], set zoom to show city limits, set max area, set up pins?
  var options = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(this.MapContext.el[0], options);

  // Generate SelectableThumbnail off of results
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    var hotelID = results["uuid"];
    var price = results["price"];
    this.ThumbListContext.add(new Context(new SizeSet(200, 200)));
    // TODO: use this instead this.ThumbListContext.add(new ResultThumb(hotelID, price));
  }
}

// TODO: extend Context
var ResultThumb = function (hotelID, price)
{
  this.price = price;
  this.hotelID = hotelID;

  // new Context(new SizeSet(200, 200))
};

function update() {
  console.log("update!");
  var rect = {
    x: 0,
    y: 0,
    w: $(window).width(),
    h: $(window).height() - 77
  };
  window.BuySearch.context.moveTo(rect);
};

Template.buy.init = function () {
  console.log("Buy Search Init");
  setTimeout(function () {
    $('#BuySearchContext')[0].appendChild(window.BuySearch.context.el[0]);
    $(window).resize(function () {
      update();
    });
    update();
  }, 1000);
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