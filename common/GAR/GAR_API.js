GAR_API = {
  PROD_URL: "https://search.getaroom.com/api",
  TEST_URL: "https://search-preprod.getaroom.com/api",
  URL: this.TEST_API_URL,
  API_KEY: "",
  USER_AUTH_TOKEN: ""
};

// Get a list of all properties.
// TODO: What are all the params?
GAR_API.allProperties = function (fn, params) {
  Meteor.http.get(this.URL+"/properties.json", params, fn);
};

// Get property by ID
GAR_API.property = function (fn, id) {
  Meteor.http.get(this.URL+"/properties/"+id+".json", fn);
};

// destination : location?
// transaction_id: ???
// check_in: 12/17/2009
// check_out: 12/17/2009
// rooms: 1
// adults: 2
// [children: 1]
GAR_API.availHotels = function (fn, params) {
  Meteor.http.get(this.URL+"/hotel_availability.json", params, fn);
};

// Room Availability Single Property
// GET /properties/<property_uuid>/room_availability?transaction_id=1234&check_in=08/01/2009&check_out=08/05/2009&rooms=1&adults=1[&children=2]
// GET /properties/<property_uuid>/room_availability?transaction_id=1234&check_in=08/01/2009&check_out=08/05/2009&rinfo=[[18,7,3]]
// - returns room availability information for the specified property along with a link directly into the booking path seeded with the passed parameters (see samples example_room_availability_no_children.xml & example_room_availability_with_children.xml)
GAR_API.availRooms = function (fn, params) {
  Meteor.http.get(this.URL+"/properties/"+params.propertyID+"/room_availability", params, fn);
};

// Room Availability (Multiple Properties)
// POST /room_availabilities?transaction_id=1234&check_in=08/01/2009&check_out=08/05/2009&rooms=1&adults=1[&children=2]
// POST /room_availabilities?transaction_id=1234&check_in=08/01/2009&check_out=08/05/2009&rinfo=[[18,7,3]]
// - pass multiple property_id[] parameters in the body of the HTTP POST request
//    property_id[]=uuid1&property_id[]=uuid2
// - returns the room availability list which include a the hotel-id for room element within a room-stay.  (see example_room_availability_multiple_properties.xml for a sample response)
GAR_API.availRoomsMulti = function (fn, params) {
  Meteor.http.get(this.URL+"/room_availabilities", params, fn);
};