Listings = new Meteor.Collection("listings");
Users = new Meteor.Collection("users");

Availabilities = new Meteor.Collection("availabilities");
Properties = new Meteor.Collection("properties");
QueryCache = new Meteor.Collection("querycache");

// Admin Data
Visitors = new Meteor.Collection("visitors");
AdminSettings = new Meteor.Collection("AdminSettings");

// Set up server-side document publishes
if (Meteor.is_server) {
  Meteor.publish('listings', function () {
    return Listings.find();
  });
  Meteor.publish('visitors', function () {
    return Visitors.find();
  });
  Meteor.publish('users', function () {
    return Users.find();
  });
  Meteor.publish('availabilities', function () {
    return Availabilities.find();
  });
  Meteor.publish('properties', function () {
    return Properties.find();
  });
}

// Set up client-size document subscriptions
if (Meteor.is_client) {
  Meteor.subscribe('listings');
  Meteor.subscribe('users'); // TODO: Push all user logic to server-side, set up auth.

  Meteor.subscribe('properties');
  Meteor.subscribe('availabilities');
  Meteor.subscribe('querycache');

  // Admin Data
  Meteor.subscribe('visitors'); 
  Meteor.subscribe('AdminSettings');
}

// EXAMPLE GAR PROPERTY
// <property>
//   <permalink>ames-hotel</permalink>
//   <review-rating nil="true" type="decimal"></review-rating>
//   <thumbnail-filename>http://image1.urlforimages.com/1215557/exterior.jpg</thumbnail-filename>
//   <time-zone>America/New_York</time-zone>
//   <uuid>ccf7ef8c-0ca6-5ad1-9bbe-ae44a81a242a</uuid>
//   <title>Ames Hotel</title>
//   <lat type="decimal">42.35865</lat>
//   <lng type="decimal">-71.057851</lng>
//   <short-description>Downtown Area</short-description>
// 
//   <sanitized-description>Ames, located in the beautiful and historic Ames building, inspires both modern style and old world sophistication. An experience rich with elegant interpretations, complemented by innovative new design by Rockwell Group, Ames brings Boston and its visitors the dynamic experience for which Morgans is known. Ideally located near historic Faneuil Hall and Beacon Hill, the 114-room Boston hotel has a vibrant restaurant and bar offering an atmosphere that is at once refined and playful, a state-of-the art fitness center and suites accented by dramatic, Romanesque arched windows and original fireplaces.</sanitized-description>
// 
//   <rating type="decimal">4.0</rating>
// 
//   <location-phone>+1 617 979 8100</location-phone>
//   <location-street>1 Boston Court</location-street>
//   <location-city>Boston</location-city>
//   <location-state>MA</location-state>
//   <location-zip>02108</location-zip>
//   <location-country>US</location-country>
// 
//     <market>
//       <permalink>boston</permalink>
//       <title>Boston</title>
//       <position>1</position>
//     </market>
// 
//     <amenities type="array">
//         <amenity>
//           <title>Fitness Center</title>
//           <uuid>305c4929-6527-4fe1-9d7b-415b5b1fb60f</uuid>
//         </amenity>
//         <amenity>
//           <title>Parking - Self</title>
//           <uuid>b9380ff4-5f7f-4108-a652-8cb508192a50</uuid>
//         </amenity>
//         <amenity>
//           <title>Room Service</title>
//           <uuid>0178b1e9-4478-40f5-92f3-82dafa958c12</uuid>
//         </amenity>
//     </amenities>
// </property>

// Dummy Availabilities
Availability = {
  // TODO: 'where' should be a destination uuid
  where: "Boston", 
  checkin: "07/07/2012",
  checkout: "07/08/2012",
  rooms: "1",
  guests: "2",

  property: "ccf7ef8c-0ca6-5ad1-9bbe-ae44a81a242a",
  price: 322.12
};
Availability2 = {
  // TODO: 'where' should be a destination uuid
  where: "Boston", 
  checkin: "07/07/2012",
  checkout: "07/08/2012",
  rooms: "1",
  guests: "2",

  property: "9bde5855-7422-533e-b470-b072c611221c",
  price: 123.32
};
Availability3 = {
  // TODO: 'where' should be a destination uuid
  where: "Boston", 
  checkin: "07/07/2012",
  checkout: "07/08/2012",
  rooms: "1",
  guests: "2",

  property: "acc1ed34-ee88-5746-a2c6-0ce0aed5bb99",
  price: 155.30
};

// Dummy Properties
Property = {
  uuid: "ccf7ef8c-0ca6-5ad1-9bbe-ae44a81a242a",
  title: "Ames Hotel",
  thumbURLs: ["http://image1.urlforimages.com/1215557/exterior.jpg"],
  lat: 42.35865,
  lng: 71.057851,
  description: "Ames, located in the beautiful and historic Ames building, inspires both modern style and old world sophistication. An experience rich with elegant interpretations, complemented by innovative new design by Rockwell Group, Ames brings Boston and its visitors the dynamic experience for which Morgans is known. Ideally located near historic Faneuil Hall and Beacon Hill, the 114-room Boston hotel has a vibrant restaurant and bar offering an atmosphere that is at once refined and playful, a state-of-the art fitness center and suites accented by dramatic, Romanesque arched windows and original fireplaces.",
  phone: "+1 617 979 8100"
};
Property2 = {
  uuid: "9bde5855-7422-533e-b470-b072c611221c",
  title: "Comfort Inn North Shore Danvers",
  thumbURLs: ["http://image1.urlforimages.com/1216656/001extfrnt.jpg"],
  lat: 42.2,
  lng: 71.0,
  description: "It is a comfortable inn!",
  phone: "+1 617 979 8100"
};
Property3 = {
  uuid: "acc1ed34-ee88-5746-a2c6-0ce0aed5bb99",
  title: "Rodeway Inn",
  thumbURLs: ["http://image1.urlforimages.com/1221283/Exterior.jpg"],
  lat: 42.4,
  lng: 71.05,
  description: "Rode is the way.",
  phone: "+1 617 979 8100"
};

// Availabilities.insert(Availability);
// Availabilities.insert(Availability2);
// Availabilities.insert(Availability3);
// Properties.insert(Property);
// Properties.insert(Property2);
// Properties.insert(Property3);