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
  buyQuery: function (q) {
    // TODO: Validate query params

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
  fetchProperty_GAR: function (uuid) {

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
      var json = xml2json(result.content);
      property = json["property"];
      if (property) {
        Properties.insert(property);
        return property;
      }

      console.log("Failed to retrieve/parse GetARoom hotel with id: "+uuid);
      return;
    }
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
  }
});
