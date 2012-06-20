Meteor.methods({
  createUser: function(user) {
    if (!user)
      throw new Meteor.Error(1, "Must pass in user object.");

    var now = Clock.now();
    _.extend(user, {
      listings: [],
      when: now,
      lastLogin: now
    });

    var id = Users.insert(user);
    return id;
  },
  createListing: function(listing) {    
    listing = listing ? listing : {};

    _.extend(listing, {
      checkinDate: Clock.today(),
      checkoutDate: Clock.tomorrow()
    });

    var id = Listings.insert(listing);
    return id;
  },
  addListing: function(userID, listingID) {
    var val = {};
    val["listings"] = listingID;
    Users.update({_id: userID}, {$addToSet: val});
    return true;
  },
  cityList: function (input) {
    if (Meteor.is_server) {
      var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
      url += "?input="+input+"&sensor=false";
      url += "&types=cities";
      url += "&key="+window.googAPI_key;
      console.log(url);
      var result = Meteor.http.get(url);
      console.log(result.statusCode);
      return result.content;
    }
  },
  algoFetchRefStates: function () {
    if (!Meteor.is_server)
      return;

    var options = {auth: "nmahalec@maytia.com:autarisi11"};
    var url = "https://test-static-shop-api.algo.travel/v1/Areas/17409/state.xml";
    var result = Meteor.http.get(url, options);
    return result.content;
  },
  algoFetchRefCitiesByState: function (stateID) {
    if (!Meteor.is_server)
      return;

    var options = {auth: "nmahalec@maytia.com:autarisi11"};
    var url = "https://test-static-shop-api.algo.travel/v1/Areas/"+stateID+"/city.xml";
    var result = Meteor.http.get(url, options);
    return result.content;
  },
  algoFetchRefAreaDetail: function (areaID) {
    if (!Meteor.is_server)
      return;

    var options = {auth: "nmahalec@maytia.com:autarisi11"};
    var url = "https://test-static-shop-api.algo.travel/v1/Areas/"+areaID+".xml";
    var result = Meteor.http.get(url, options);
    return result.content;
  },
  algoCityInfo: function (id) {
    if (!Meteor.is_server)
      return;

    var url = "https://test-static-shop-api.algo.travel/v1/Areas/"+id+".xml";
    var result = Meteor.http.get(url, {auth: "nmahalec@maytia.com:autarisi11"});
    return result.content;
  },
  algoFetchProperty: function (id) {
    if (!Meteor.is_server)
      return;

    function parseHotelInfo(xml) {
      return {
        name: xml.match(/name="([^"]+)"/)[1],
        lng: xml.match(/longitude="([^"]+)"/)[1],
        lat: xml.match(/latitude="([^"]+)"/)[1],
        photos: [xml.match(/full-size="([^"]+)"/)[1]],
        description: xml.match(/<descriptions language="en-GB">\s*<description hotel-description-code="hotel-description">\s*<!\[CDATA\[([^\]]+)\]\]>/)[1]
      };
    };

    var options = {auth: "nmahalec@maytia.com:autarisi11"};
    var url = "https://test-static-shop-api.algo.travel/v1/Hotels/" + id + ".xml";
    var result = Meteor.http.get(url, options);
    return parseHotelInfo(result.content);
  },
  algoBuyQuery: function (q) {
    if (!Meteor.is_server)
      return;

    this.unblock();

    // Algo.Travel Search Query
    var url = "https://test-availability-shop-api.algo.travel/v1/search-hotel-by-area";
    url += "?currency-code=USD";

    // Look up areaID
    var areaID = reverseLookupAreaID(q["where"]);
    url += "&area-id=" + areaID;

    // Convert Dates to YYYYMMDD format
    var checkin = convertToYYYYMMDD(q["checkin"]);
    var checkout = convertToYYYYMMDD(q["checkout"]);
    url += "&checkin-date=" + checkin;
    url += "&checkout-date=" + checkout;

    // Number of rooms
    url += "&number-of-rooms=1";
    // url += "&number-of-rooms="+q["rooms"];

    // Add adult/child count per room
    url += "&room-1-adult-count="+q["guests"];
    url += "&room-1-child-count=0";

    var result;
    console.log(url);

    if (QueryCache && QueryCache.findOne({url: url})) {
      result = QueryCache.findOne({url: url});
      console.log("Cache Hit: Algo Availabilities.");
    } else {
      var options = {auth: "nmahalec@maytia.com:autarisi11"};
      result = Meteor.http.get(url, options);
      result.url = url;

      var status = result.statusCode;
      if ((status == 200 || status == "200") && QueryCache)
        QueryCache.insert(result);
      console.log(status);
    }

    return result.content;
  },
  garBuyQuery: function (q) {
    // TODO: Validate query params

    // TODO: Set a timeout on the clientside to look for
    // cached results if the server takes too long.

    if (Meteor.is_server) {
      this.unblock();

      // GetARoom API Search
      var url = "http://www.integration2.getaroom.com";
      url += "/searches/hotel_availability.json";
      url += "?destination="+q["where"];
      url += "&transaction_id=123456";
      url += "&check_in="+q["checkin"];
      url += "&check_out="+q["checkout"];
      url += "&rooms="+q["rooms"];
      url += "&adults="+q["guests"];
      url += "&api_key=0cd7495d-211c-43c6-8628-67e998f4207e";
      url += "&auth_token=1b439684-a9a5-4fd6-9ad9-6f0c3d54eb45";

      var result;
      // console.log(url);

      if (QueryCache && QueryCache.findOne({url: url})) {
        result = QueryCache.findOne({url: url});
        console.log("Cache Hit: GAR Availabilities.");
      } else {
        result = Meteor.http.get(url);
        result.url = url;

        var status = result.statusCode;
        if ((status == 200 || status == "200") && QueryCache)
          QueryCache.insert(result);
        console.log(status);
      }

      return result.content;
    }
  },
  garFetchProperty: function (uuid) {

    if (Meteor.is_server) {
      this.unblock();

      // Check for cached result first
      var property = Properties.findOne({uuid: uuid});
      if (property) {
        console.log("Cache Hit: GAR Property");
        return property;
      }

      // Construct Query URL
      // ex: http://www.integration2.getaroom.com/api/properties/152d7634-00ff-55cd-ac46-3e73f24a2574.xml?api_key=0cd7495d-211c-43c6-8628-67e998f4207e&auth_token=1b439684-a9a5-4fd6-9ad9-6f0c3d54eb45
      var url = "http://www.integration2.getaroom.com"
      url += "/api/properties/"+uuid+".xml";
      url += "?api_key=0cd7495d-211c-43c6-8628-67e998f4207e";
      url += "&auth_token=1b439684-a9a5-4fd6-9ad9-6f0c3d54eb45";
      // console.log(url);

      // Fetch Property Data
      // TODO: De-dup/block identical queries?
      var result = QueryCache.findOne({url: url});
      if (result) {
        console.log("Cache Hit: Query Cache");
        result = QueryCache.findOne({url: url});
      } else {
        result = Meteor.http.get(url);
        result.url = url;

        var status = result.statusCode;
        if (status == 200 || status == "200")
          QueryCache.insert(result);
        console.log(status);
      }

      // Cache Property Data
      var json = xml2json_GetARoom(result.content);
      property = json["property"];
      if (property) {
        Properties.insert(property);
        return property;
      }

      console.log("Failed to retrieve/parse GetARoom hotel with id: "+uuid);
      return;
    }
  },
  // Algo API tests
  algoReferenceTest: function () {
    // Reference data types we need to query:
    // AreaTypes
    // BoardTypes
    // BookingStatusTypes
    // Currencies
    // HotelDescriptionTypes
    // HotelFacilityTypes
    // Languages
    // PaymentCardTypes
    // PaymentTerms
    // PhotoTypes
    // PromotionTypes
    // RoomFacilityTypes
    // RoomTypes
    // SpecialRequestTypes
    // StaticDataObjectTypes
    // Titles
    // ViewTypes

    // Example of querying AreaTypes:
    var result = Meteor.http.get("https://test-static-shop-api.algo.travel/v1/AreaTypes.xml",
              {auth: "nmahalec@maytia.com:autarisi11"});
    return result.content;
  },
  algoStaticTest: function () {
    // This is used for first-time fetching. Get all continents, then country for each continent,
    // then states, county, city, etc.
    var result = Meteor.http.get("https://test-static-shop-api.algo.travel/v1/Hotels/16658.xml",
              {auth: "nmahalec@maytia.com:autarisi11"});
    return result.content;

    // that last number in the url is the last-known change ID. This is used for
    // updating existing static data.
    // var result = Meteor.http.get("https://test-static-shop-api.algo.travel/v1/254545",
    //           {auth: "nmahalec@maytia.com:autarisi11"});
    // return result.content;
  },
  algoAvailabilityTest: function () {
    var result = Meteor.http.get("https://test-availability-shop-api.algo.travel/v1/search-hotel-by-area?currency-code=GBP&area-id=123&checkin-date=20120301&checkout-date=20120302&number-of-rooms=1&room-1-adult-count=2&room-1-child-count=0",
              {auth: "nmahalec@maytia.com:autarisi11"});
    return result.content;

    // There's also a bundle availability query, which I think searches for a specific bundle we can use for booking.
  },
  algoBookingTest: function () {
    // This code is just here to get a bundle ID that's available, we won't need it in the real world.
    var result = Meteor.http.get("https://test-availability-shop-api.algo.travel/v1/search-bundle-availability?currency-code=GBP&hotel-id=12345&checkin-date=20121001&checkout-date=20121002&number-of-rooms=1&room-1-adult-count=1&room-1-child-count=0",
              {auth: "nmahalec@maytia.com:autarisi11"});
    var bundleID = result.content.match(/bundle-id=\"[^\"]+/)[0];
    bundleID = bundleID.replace(/bundle-id=/,'').replace(/\"/,'');

    // Everything here is required, there's a whole bunch of optional ones too.
    var params = {
      "bundle-id": bundleID,
      "shop-reference-id": null,
      "reserver-title-code": "mr",
      "reserver-first-name": "Kenny",
      "reserver-last-name": "Everett",
      "reserver-email-address": "reserver@domain.com",
      "reserver-phone-number": "+44 207 100 1234",
      "reserver-language-id": "1",
      // We can reserve up to 3 rooms at a time
      "room-1-title-code": "mr",
      "room-1-first-name": "Kenny",
      "room-1-last-name": "Everett"
    };

    var result = Meteor.http.post("https://test-booking-shop-api.algo.travel/v1/make-booking",
              {auth: "nmahalec@maytia.com:autarisi11", params: params});
    return result.content;

    // We can also fetch details and cancel the bookings that were made through this API.
  }
});
