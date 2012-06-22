function xml2json_algoHotel (xml) {
  retVal = {};
  var temp = xml.match(/name="([^"]+)"/);
  if (temp)
    retVal.name = temp[1];

  temp = xml.match(/longitude="([^"]+)"/);
  if (temp)
    retVal.lng = temp[1];

  temp = xml.match(/latitude="([^"]+)"/);
  if (temp)
    retVal.lat = temp[1];

  temp = xml.match(/full-size="([^"]+)"/);
  if (temp)
    retVal.photos = [temp[1]];

  xml.substring(xml.search('<descriptions language="en-GB">'));
  xml.substring(xml.search(0, '</descriptions>'));
  temp = xml.match(/<description hotel-description-code="hotel-description">\s*<!\[CDATA\[([^\]]+)\]\]>/);
  if (temp)
    retVal.description = temp[1];

  return retVal;
};

function xml2json_algoAvails(xml) {
  var hotels = xml.split(/<hotel\s/);
  var retVal = [];
  for (var i = 1; i < hotels.length; i++) {
    var hotelTag = hotels[i];
    var hotel = {
      "hotel-id": hotelTag.match(/hotel-id="(\d+)"/)[1],
      "net-price": hotelTag.match(/net-price="([^"]+)"/)[1]
    };

    retVal.push(hotel);
  }
  return retVal;
};

var HttpCache = {};
function httpGetAndCache(url, options) {
  if (!HttpCache[url]) {
    var result = Meteor.http.get(url, options);
    if (!result) return null;
    
    var status = result.statusCode;
    console.log(status);

    if (status == 200 || status == "200")
      HttpCache[url] = result;
    else
      return null;
  } else {
    console.log("HTTP Cache Hit");
  }

  return HttpCache[url];
};

function httpGetNoCache(url, options) {
  var result = Meteor.http.get(url, options);
  var status = result.statusCode;
  console.log(status);
  return result;
};

var SHOP_CODE = "???";

var HttpOptions = [];
HttpOptions["algo"] = {auth: "nmahalec@maytia.com:autarisi11"};

var TestURLs = {
  algoStatic : "https://test-static-shop-api.algo.travel/v1",
  algoAvails : "https://test-availability-shop-api.algo.travel/v1",
  algoBooking: "https://test-booking-shop-api.algo.travel/"
};
var ProdURLs = {
  algoStatic : "https://static-shop-api.algo.travel/"+SHOP_CODE+"/",
  algoAvails : "https://availability-shop-api.algo.travel/"+SHOP_CODE+"/",
  algoBooking: "https://booking-shop-api.algo.travel/"+SHOP_CODE+"/"
};

Algo = {
  mode: "test",

  get: function (url, options, donotcache){
    if (donotcache)
      return httpGetNoCache(url, options);
    return httpGetAndCache(url, options);
  },
  getStatic: function (path, donotcache) {
    var mode = Algo.mode;
    var url = mode == "test" ? TestURLs["algoStatic"] : ProdURLs["algoStatic"];
    var options = HttpOptions["algo"];
    return Algo.get(url+path, options, donotcache);
  },
  getAvails: function (path, donotcache) {
    var mode = Algo.mode;
    var url = mode == "test" ? TestURLs["algoAvails"] : ProdURLs["algoAvails"];
    var options = HttpOptions["algo"];
    return Algo.get(url+path, options, donotcache);
  },
  getStateList: function () {
    return Algo.getStatic("/Areas/17409/state.xml");
  },
  getCityListByState: function (id) {
    return Algo.getStatic("/Areas/"+id+"/city.xml");
  },
  getAreaInfo: function (id) {
    return Algo.getStatic("/Areas/"+id+".xml");
  },
  getHotel: function (id) {
    return Algo.getStatic("/Hotels/"+id+".xml");
  },
  getCity: function (id) {
    return Algo.getAreaInfo(id);
  },
  getState: function (id) {
    return Algo.getAreaInfo(id);
  },
  getAvailsByArea: function (areaID, q) {
    var path = "/search-hotel-by-area";

    // Construct query string with params
    var query = "?currency-code=USD";
    query += "&area-id=" + areaID;
    // Convert Dates to YYYYMMDD format
    var checkin = convertToYYYYMMDD(q["checkin"]);
    var checkout = convertToYYYYMMDD(q["checkout"]);
    query += "&checkin-date=" + checkin;
    query += "&checkout-date=" + checkout;
    // Number of rooms
    query += "&number-of-rooms=1";
    // url += "&number-of-rooms="+q["rooms"];
    // Add adult/child count per room
    query += "&room-1-adult-count="+q["guests"];
    query += "&room-1-child-count=0";

    return Algo.getAvails(path+query, true);
  }
};

Meteor.methods({
  algoFetchRefStates: function () {
    this.unblock();
    var result = Algo.getStateList();
    return result.content;
  },
  algoFetchRefCitiesByState: function (id) {
    this.unblock();
    var result = Algo.getCityListByState(id);
    return result.content;
  },
  algoFetchRefAreaDetail: function (id) {
    this.unblock();
    var result = Algo.getAreaInfo(id);
    return result.content;
  },
  algoCityInfo: function (id) {
    this.unblock();
    var result = Algo.getCity(id);
    return result.content;
  },
  algoFetchProperty: function (id) {
    this.unblock();
    var result = Algo.getHotel(id);
    var status = result.statusCode;

    if (!(status == 200 || status == "200"))
      return null;

    var json = xml2json_algoHotel(result.content);
    return json;
  },
  algoBuyQuery: function (q, areaID) {
    var result = Algo.getAvailsByArea(areaID, q);
    var status = result.statusCode;

    if (!(status == 200 || status == "200"))
      return null;

    var json = xml2json_algoAvails(result.content);
    return json;
  }
})