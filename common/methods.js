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
  buyQuery: function (where, checkin, checkout, rooms, guests) {
    // TODO: Validate query params

    if (Meteor.is_server) {
      this.unblock();

      // GetARoom API Search
      var url = "http://www.integration2.getaroom.com/searches/hotel_availability.json";
      url += "?destination="+where;
      url += "&transaction_id=123456";
      url += "&check_in="+checkin;
      url += "&check_out="+checkout;
      url += "&rooms="+rooms;
      url += "&adults="+guests;
      url += "&api_key=0cd7495d-211c-43c6-8628-67e998f4207e";
      url += "&auth_token=1b439684-a9a5-4fd6-9ad9-6f0c3d54eb45";

      console.log(url);
      // var result = Meteor.http.get(url);
      // console.log(result.statusCode);
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
      return result;
    }
  }
});
