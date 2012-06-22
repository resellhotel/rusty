// Server-side only methods
Meteor.methods({
  toggleDebug: function(password) {
    if (Session.equals("AdminPassword", password))
      AdminSettings.update({name: "debug"}, {$set: {enabled: true}});
  },
  emitMessage: function (msg) {
    console.log(msg);
  },
  cityList: function (input) {
    var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    url += "?input="+input+"&sensor=false";
    url += "&types=cities";
    url += "&key="+window.googAPI_key;
    console.log(url);
    var result = httpGetAndCache(url);
    console.log(result.statusCode);
    return result.content;
  },
  garBuyQuery: function (q) {
    if (!Meteor.is_server) return;
    this.unblock();

    // TODO: Validate query params

    // TODO: Set a timeout on the clientside to look for
    // cached results if the server takes too long.

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
    result = httpGetAndCache(url);

    return result.content;
  },
  garFetchProperty: function (uuid) {
    if (!Meteor.is_server) return;
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
    result = httpGetAndCache(url);

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
});