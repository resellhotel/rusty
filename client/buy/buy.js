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
  initDatePicker('checkin', Clock.today(), function () {
    // $('#checkout').focus();
  });
  initDatePicker('checkout', Clock.tomorrow());
};

var eventSels = ['#where', '#checkin', '#checkout', '#rooms', '#guests'];
var eventMap = FormGuy.okcancel_events(eventSels);

Template.BuyNavbar.events = {};
Template.BuyNavbar.events[eventMap] = FormGuy.make_okcancel_handler({
  ok: function (input, evt) {
    var q = Session.get("BuyQuery");
    var value = input.value;

    // We want just the number from guests/rooms
    if (input.id == "rooms" || input.id == "guests")
      value = value.split(" ")[0];
    q[input.id] = value;

    Session.set("BuyQuery", q);
    if (!isBuyQueryValid(q)) {
      Session.set("BuySearchResults", []);
      return;
    }
  }
});

Template.BuyNavbar.events["click #SearchButton"] = function ()
{
  console.log("search!");
  var q = Session.get("BuyQuery");
  window.BuySearch.search(q);
};

BootstrapStripedProgressBarContext = function ()
{
  var context = new Context(new SizeSet("*", "*"));
  context.percent = 0;

  var bar = $("<div>");
  bar.toggleClass("bar");
  context.el.append(bar);
  context.bar = bar;

  context.toggleClass("progress");
  context.toggleClass("progress-striped");
  context.toggleClass("active");
  context.el.css("z-index", "11");

  context.setProgress = function (fraction)
  {
    if (fraction > 1)
      this.percent = 1;
    else
      this.percent = fraction;

    this.bar.width((100*this.percent)+"%");
  };
  context.getProgress = function ()
  {
    return this.percent;
  };

  return context;
};

var LIST_WIDTH = 600;
BuySearchContext = function () 
{
  this.resultThumbs = [];
  this.mapPins = [];
  this.geocoder = new google.maps.Geocoder();

  this.context = new Context(new SizeSet("*", "*"));
  this.MainContent = new Context(new SizeSet("*", "*"));
  this.context.add(this.MainContent, new Area(0, 77, [0, 1], [-77, 1]));

  this.MapContext = new Context(new SizeSet("*", "*"));
  this.MapArea = new Area(0, 0, [0, 1], [0, 1]);
  this.MainContent.add(this.MapContext, this.MapArea);

  this.ThumbListContext = new Context(new SizeSet("*", "*"), true);
  this.MainContent.add(this.ThumbListContext, new Area([-1*LIST_WIDTH, 1], 0, [LIST_WIDTH, 0], [0, 1]));
  this.ThumbListContext.toggleClass("ThumbList");
  this.ThumbListContext.el.css("z-index", 10);
  this.ThumbListContext.el.hide();

  var that = this;
  document.body.appendChild(this.context.el[0]);
  var onresize = function () {
    console.log("Layout!");
    var rect = {
      x: 0,
      y: 0,
      w: $(window).width(),
      h: $(window).height()
    };
    that.context.layout(rect);
  };
  this.forceLayout = onresize;
  $(window).resize(onresize);
  onresize();

  Meteor.autosubscribe(function () {
    var visible = Session.equals('mode', 'buy');
    var display = visible ? "block" : "none";
    that.context.el.css('display', display);

    if (visible) {
      var input = $('#where')[0];
      var options = {
        types: ['(cities)'],
        componentRestrictions: {country: 'us'}
      };
      window.whereAutocomplete = new google.maps.places.Autocomplete(input, options);
    }
    // Using Bootstrap
    // $('#where').typeahead({ source: window.cityNameList, items: 7 });
  });

};

BuySearchContext.prototype.showProgress = function ()
{
  if (!this.progressBar) {
    this.progressBar = new BootstrapStripedProgressBarContext();
    this.MainContent.add(this.progressBar, new Area(0, 0, [0, 1], 20));
  }
  this.progressBar.setProgress(0);

  var that = this;
  var interval = 33.3; // ms
  var maxTime = 30000; // ms
  var increment = interval/maxTime;
  this.progressBar.intervalID = Meteor.setInterval(function () {
    var fraction = that.progressBar.getProgress();
    that.progressBar.setProgress(fraction + increment);
  }, interval);

  that.progressBar.el.slideDown("fast");
};
BuySearchContext.prototype.hideProgress = function ()
{
  if (!this.progressBar)
    return;
  if (this.progressBar.intervalID) {
    Meteor.clearInterval(this.progressBar.intervalID);
    this.progressBar.intervalID = null;
  }
  this.progressBar.el.slideUp("slow");
};
BuySearchContext.prototype.search = function (q)
{
  var that = this;

  if (!isBuyQueryValid(q)) {
    console.log("Invalid Search Query");
    return;
  }

  // Clean up OLD results
  if (this.resultThumbs && this.resultThumbs.length) {
    this.resultThumbs = [];
    this.ThumbListContext.subcontexts = [];
    this.ThumbListContext.subareas = [];
    this.ThumbListContext.el.empty();
    Meteor.setTimeout(function () {
      that.ThumbListContext.el.hide();
    }, 1000);
    this.MapArea.w[0] = 0;
    window.BuySearch.forceLayout();
  }

  // Get NEW results
  this.showProgress();
  Session.set("BuyHasSearchResults", true);
  Meteor.call("buyQuery", q, function (error, xml_result) {
    console.log("Server: buyQuery call complete");
    window.err = error;
    window.res = result;

    if (window.err) {
      that.hideProgress();
      alert("Oops, this search caused an error! Please try again later.");
      console.log(error);
      return;
    }

    // Parse out xml result into json
    var json = xml2json(xml_result);
    var stays = json["hotel-stays"];
    if (!stays || !stays["hotel_stay"]) {
      that.hideProgress();
      alert("Sorry, no results matched your search.");
      return;
    }

    // Less than 2 stays won't form an array, convert to array
    // TODO: What if there are 0 stays?
    var stayList = stays["hotel_stay"];
    if (!stayList.length)
      stayList = [stayList];

    // Generate list of ResultThumbs
    for (var i = 0; i < stayList.length; i++) {
      var result = stayList[i];
      that.resultThumbs[i] = new GAR_ResultThumb(result);
      that.ThumbListContext.add(that.resultThumbs[i].context);
    }
    Meteor.setTimeout(function () {
      that.ThumbListContext.el.show();
      Meteor.setTimeout(function () {
        that.MapArea.w[0] = -1*LIST_WIDTH;
        window.BuySearch.forceLayout();
      }, 600);
    }, 500);

    that.progressBar.setProgress(1);
    Meteor.setTimeout(function () {
      that.hideProgress();
    }, 500);

  }); // END buyQuery call

  // Set up Map
  if (!this.map) {
    // TODO: look up lat/lng for q["where"], set zoom to show city limits, set max area, set up pins?
    var options = {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.MapContext.el[0], options);
  }
  // TODO: cleanly delete old pins
  this.map.pins = [];

  // Center the map
  this.geocoder.geocode({'address': q["where"]}, function (geocodes, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      that.map.setCenter(geocodes[0].geometry.location);
    } else {
      alert("Sorry, we weren't able to find that US city on the map. Did you type the name correctly?");
    }
  });

  // Set up Marker Icons
  if (!this.map.iconSelected) {
    this.map.iconSelected = new google.maps.MarkerImage(
      iconImageURL("2980CA"),
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
    this.map.iconUnselected = new google.maps.MarkerImage(
      iconImageURL("FE7569"),
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
    this.map.iconHover = new google.maps.MarkerImage(
      iconImageURL("CFB52B"),
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
    this.map.iconShadow = new google.maps.MarkerImage(
      "http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
      new google.maps.Size(40, 37),
      new google.maps.Point(0, 0),
      new google.maps.Point(12, 35));
  }
};

// TODO: extend Context
var GAR_ResultThumb = function (result, resultID)
{
  this.resultID = resultID;
  this.result = result;

  // Listing Data
  this.price = result["lowest-average"];
  this.thumbURL = result["thumbnail_filename"];
  this.hotelTitle = result["title"];
  this.propertyID = result["uuid"];
  
  var that = this;
  Meteor.call('fetchProperty_GAR', this.propertyID, function (error, propertyData) {
    if (error) {
      console.log("Could not fetch GAR property with id: "+that.propertyID);
      return;
    }
    that.selected = false;
    that.property = propertyData;

    that.lat = parseFloat(that.property.lat);
    that.lng = parseFloat(that.property.lng);
    that.latlngGoog = new google.maps.LatLng(that.lat, that.lng, true);
    that.map = window.BuySearch.map;
    that.dropPin();
  });

  // Self Context
  this.context = new Context(new SizeSet(200, 200));
  this.context.toggleClass("ResultThumb");
  this.context.el.css('background-image', 'url('+this.thumbURL+')');
  this.context.el.css('background-repeat', 'no-repeat');
  this.context.el.css('background-size', 'cover');
  this.context.el.click(function (e) {that.toggleSelected();});
  this.context.el.hover(
    function (e) {
      that.startHover();
    },
    function (e) {
      that.endHover();
    }
  );

  // Overlay Layer
  this.overlayContext = new Context(new SizeSet("*", "*"));
  this.overlayContext.toggleClass('ColorOverlay');
  this.context.add(this.overlayContext, new Area(0, 0, [0, 1], [0, 1]));

  // Info Layer
  this.infoContext = new Context(new SizeSet("*", "*"));
  this.infoContext.toggleClass("ThumbInfo");
  this.overlayContext.add(this.infoContext, new Area(10, 10, [-20, 1], [-20, 1]));

  // Hotel Name
  this.infoContext.el.append($("<h3>"+this.hotelTitle+"</h3>"));
  // Hotel Price
  this.priceContext = new Context(180, 48);
  this.priceContext.toggleClass('Price');
  this.priceContext.el[0].innerHTML = "<br>$"+Math.ceil(this.price);
  this.infoContext.add(this.priceContext, new Area("c", "c", [180, 0], [48, 0]));
  // Hotel Rating
  this.ratingContext = new Context(90, 14);
  this.ratingContext.toggleClass('StarRating');
  this.infoContext.add(this.ratingContext, new Area("c", 124, [90, 0], [14, 0]));
  // More Info Button
  this.moreInfoContext = new Context("*", "*");
  this.moreInfoContext.toggleClass('MoreInfoButton');
  this.moreInfoContext.toggleClass('btn');
  this.infoContext.add(this.moreInfoContext, new Area("c", [-33, 1], [90, 0], [28, 0]));
  this.moreInfoContext.el.click(function (e) {that.toggleInfo(e);});

  // More Info Button Text
  this.moreInfoContext.textContext = new Context("*", "*");
  this.moreInfoContext.textContext.el[0].innerHTML = "More Info";
  this.moreInfoContext.add(this.moreInfoContext.textContext, new Area("c", "c", [0,1], [18,0]));
};
GAR_ResultThumb.prototype.dropPin = function ()
{
  if (this.pin)
    return;

  var markerOpts = {
    position: this.latlngGoog,
    map: this.map,
    icon: this.map.iconUnselected,
    shadow: this.map.iconShadow
  };
  this.pin = new google.maps.Marker(markerOpts);
  this.map.pins.push(this.pin);

  var that = this;
  google.maps.event.addListener(this.pin, 'click', function () {
    that.toggleSelected();
  });
};
GAR_ResultThumb.prototype.toggleSelected = function ()
{
  this.selected = !this.selected;
  if (this.selected)
    this.pin.setIcon(this.map.iconSelected);
  else
    this.pin.setIcon(this.map.iconUnselected);
  this.context.el.toggleClass("selected");
};
GAR_ResultThumb.prototype.toggleInfo = function (event)
{
  this.moreInfoContext.showingInfo = !this.moreInfoContext.showingInfo;
  this.moreInfoContext.textContext.el[0].innerHTML = 
    this.moreInfoContext.showingInfo ? "Less Info" : "More Info";

  if (this.moreInfoContext.showingInfo) {
    if (!this.hotelInfoContext) {
      this.hotelInfoContext = new Context("*", "*");
      this.hotelInfoContext.toggleClass("singleHotelInfo");
    }
    document.body.appendChild(this.hotelInfoContext.el[0]);
  } else {
    document.body.removeChild(this.hotelInfoContext.el[0]);
  }

  // select it if it's not selected but don't deselected it if it is selected.
  if (this.selected)
    event.preventPropagation();
}

GAR_ResultThumb.prototype.startHover = function ()
{
  this.pin.setIcon(this.map.iconHover);
};
GAR_ResultThumb.prototype.endHover = function ()
{
  if (this.selected)
    this.pin.setIcon(this.map.iconSelected);
  else
    this.pin.setIcon(this.map.iconUnselected);
};

// TODO: Clean me up!
function placeDetail (ref) {
  var url = "https://maps.googleapis.com/maps/api/place/details/json"
  url += "?reference=CkQxAAAAYCJqG3dlqlrXDePMraWuFijEufiYTHoaiAt7TyaWX5PNHatpr5zqS5p7epkoPfwaTPTa0ErCa-6VN_nr2s4N3hIQ53sEr6tIc-NzwUQTXmxAKBoU-yMuSPMeY5PKzWRdabbQXONcenE";
  url += "&sensor=true";
  url += "&key="+window.googAPI_key;

  $.jsonp({
    url: url,
    callbackParameter: "callback",
    success: function(json, textStatus) {
      window.r = json;
      console.log(textStatus);
    },
    error: function(xOptions, textStatus) {
      console.log("error");
      console.log(xOptions);
      console.log(textStatus);
    },
    complete: function() {
      console.log("complete");
    }
  });
};

