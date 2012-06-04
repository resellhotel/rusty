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
// Template.BuyNavbar.events['keydown #where'] = function (e)
// {
//   console.log("keydown #where");
//   var value = $('#where').val();
//   // if (value matches a city)
//   //   map.showcity(value);
// };
Template.BuyNavbar.events["click #SearchButton"] = function ()
{
  console.log("search!");
  var q = Session.get("BuyQuery");
  window.BuySearch.search(q);
};

BuySearchContext = function () 
{
  this.resultThumbs = [];

  this.context = new Context(new SizeSet("*", "*"));
  this.MainContent = new Context(new SizeSet("*", "*"));
  this.context.add(this.MainContent, new Area(0, 77, [0, 1], [-77, 1]));

  this.MapContext = new Context(new SizeSet("*", "*"));
  this.MainContent.add(this.MapContext, new Area(0, 0, [0, .6], [0, 1]));

  this.ThumbListContext = new Context(new SizeSet("*", "*"));
  this.ThumbListContext.isScrollable = true;
  this.MainContent.add(this.ThumbListContext, new Area([0, .6], 0, [0, .4], [0, 1]));

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
  $(window).resize(onresize);
  onresize();

  Meteor.autosubscribe(function () {
    var visible = Session.equals('mode', 'buy');
    var display = visible ? "block" : "none";
    if (visible)
      $('#where').typeahead({ source: window.cityNameList, items: 7 });
    that.context.el.css('display', display);
  });

};

function xml2json(xml) {
  // At a leaf node, return data
  if (xml.indexOf("<") == -1)
    return xml;

  var headerL = xml.indexOf("<?xml");
  if (headerL != -1) {
    var headerR = xml.indexOf(">", headerL);
    var xmlbody = xml.substring(headerR+1);
    return xml2json(xmlbody);
  }

  var data = {};
  var startL = 0, startR = 0, endL = 0, endR = -1;

  while (1) {
    // No more tags to process
    if (xml.indexOf("<", endR+1) == -1)
      return data;

    // Assume there exists a well-formed tag to parse
    startL = xml.indexOf("<", endR+1);
    startR = xml.indexOf(">", endR+1);
    if (xml.charAt(startR-1) == "/")
      return xml.substring(startL+1, startR-1);

    var tagname = xml.substring(startL+1, startR).split(" ")[0];
    var endtag = "</"+tagname+">";
    endL = xml.indexOf(endtag, startR);
    endR = endL + endtag.length;

    var innerXML = xml.substring(startR+1, endL);
    if (data[tagname]) {
      if (!data[tagname].length) {
        var o = data[tagname];
        data[tagname] = [];
        data[tagname].push(o);
      }
      data[tagname].push(xml2json(innerXML));
    } else {
      data[tagname] = xml2json(innerXML);
    }
  }

  // Should never reach this point...
  return data;
};

function parseTag(name, string) {
  var tag = "<"+name+">";
  var endtag = "</"+name+">";
  var a = string.indexOf(tag);
  var b = string.indexOf(endtag);
  return string.substring(a+tag.length, b);
}

BuySearchContext.prototype.search = function (q)
{
  var that = this;
  console.log(q);

  if (!isBuyQueryValid(q)) {
    console.log("Invalid Search Query");
    return;
  }

  // Clean up OLD results
  if (this.resultThumbs && this.resultThumbs.length) {
    console.log("TODO: Clear out result thumbs correctly.");
    // this.context.removeSubcontexts
    this.resultThumbs = [];
  }

  // Get NEW results
  // TODO: merge these both into a server call to get current results and updated results
  // var results = Availabilities.find({where: q["where"]}).fetch();
  Meteor.call("buyQuery", q, function (error, xml_result) {
    console.log("Server: buyQuery call complete");
    window.err = error;
    window.res = result;

    // Parse out xml result into json
    var stays = [];
    if (!window.err) {
      var result = xml2json(xml_result);

      // Break out first level object
      var o1 = result["hotel-stays"];
      if (!o1) {
        console.log("No results found.");
        return;
      }

      // Break out second level object
      stays = o1["hotel_stay"];
      if (!stays) {
        console.log("No results found.");
        return;
      }

      // Less than 2 stays won't form an array, convert to array
      // TODO: What if there are 0 stays?
      if (!stays.length)
        stays = [stays];

      // --- Old method of parsing manually ---
      // var strs = xml_result.split("<hotel_stay>");
      // for (var i = 1; i < strs.length; i++) {
      //   var stay = {};
      //   var str = strs[i];
      //   stay["uuid"] = parseTag("uuid", str);
      //   stay["title"] = parseTag("title", str);
      //   stay["thumbURL"] = parseTag("thumbnail_filename", str);
      //   stay["price"] = parseTag("lowest-average", str);
      //   stays[i-1] = stay;
      // }

    } else {
      console.log("Buy Search Query failed.");
      console.log(error);
      return;
    }

    // Generate list of ResultThumbs
    for (var i = 0; i < stays.length; i++) {
      var result = stays[i];
      that.resultThumbs[i] = new GAR_ResultThumb(result);
      that.ThumbListContext.add(that.resultThumbs[i].context);
    }

  }); // END buyQuery call

  // Reposition Map
  // TODO: look up lat/lng for q["where"], set zoom to show city limits, set max area, set up pins?
  var options = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(this.MapContext.el[0], options);
  this.geocoder = new google.maps.Geocoder();
  this.geocoder.geocode({'address': q["where"]}, function (geocodes, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      that.map.setCenter(geocodes[0].geometry.location);
    } else {
      console.log("Geocoder callback failed");
    }
  });

  // Setup Map Places
  // this.places = new google.maps.places.PlacesService(this.map);
  // var req = {reference: "CkQxAAAAYCJqG3dlqlrXDePMraWuFijEufiYTHoaiAt7TyaWX5PNHatpr5zqS5p7epkoPfwaTPTa0ErCa-6VN_nr2s4N3hIQ53sEr6tIc-NzwUQTXmxAKBoU-yMuSPMeY5PKzWRdabbQXONcenE"};
  // var placecallback = function (place, status) {
  //   if (status == google.maps.places.PlacesServiceStatus.OK) {
  //     var loc = place.geometry.location;
  //     var options = {
  //       center: new google.maps.LatLng(-34.397, 150.644),
  //       zoom: 8,
  //       mapTypeId: google.maps.MapTypeId.ROADMAP
  //     };
  //     this.map = new google.maps.Map(this.MapContext.el[0], options);
  //   } else {
  //     console.log("place callback failed");
  //   }
  // };
  // this.place.getDetails(req, placecallback);
}

// TODO: extend Context
var GAR_ResultThumb = function (result, resultID)
{
  var that = this;

  this.resultID = resultID;
  this.result = result;

  this.price = result["lowest-average"];
  this.propertyID = result["uuid"];
  this.thumbURL = result["thumbnail_filename"];
  this.hotelTitle = result["title"];
  // this.property = Properties.findOne({uuid: this.propertyID});
  Meteor.call('fetchProperty_GAR', this.propertyID, function (error, xml_result) {
    if (!error) {
      var result = xml2json(xml_result);
      if (result.property)
        that.property = result.property;
    } else {
      console.log("Could not fetch GAR property with id: "+that.propertyID);
      return;
    }
  });

  // Overall Context
  this.context = new Context(new SizeSet(200, 200));
  this.context.toggleClass("ResultThumb");
  this.context.el.css('background-image', 'url('+this.thumbURL+')');
  this.context.el.click(function (e) {that.context.el.toggleClass("selected")});

  // Overlay Context
  this.overlayContext = new Context(new SizeSet("*", "*"));
  this.overlayContext.toggleClass('ColorOverlay');
  this.context.add(this.overlayContext, new Area(0, 0, [0, 1], [0, 1]));

  this.infoContext = new Context(new SizeSet("*", "*"));
  this.infoContext.toggleClass("ThumbInfo");
  this.overlayContext.add(this.infoContext, new Area(10, 10, [-20, 1], [-20, 1]));

  // Hotel Name
  this.infoContext.el.append($("<h3>"+this.hotelTitle+"</h3>"));
  // Hotel Price
  this.priceContext = new Context(180, 48);
  this.priceContext.toggleClass('Price');
  this.priceContext.el[0].innerHTML = "$"+Math.ceil(this.price);
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

  var buttonText = new Context("*", "*");
  buttonText.el[0].innerHTML = "More Info";
  this.moreInfoContext.add(buttonText, new Area("c", "c", [0,1], [18,0]));
};

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
  // Meteor.http.get(url, function (err, result){
  //   window.e = err;
  //   window.r = result;
  // });
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
