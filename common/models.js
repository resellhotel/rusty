Listings = new Meteor.Collection("listings");
Users = new Meteor.Collection("users");

Availabilities = new Meteor.Collection("availabilities");
Properties = new Meteor.Collection("properties");
QueryCache = new Meteor.Collection("querycache");


// Reference Data
AlgoAreas = new Meteor.Collection("AlgoAreas");
// AlgoArea:
  // areaID
  // type
  // (states/cities)
Cities = new Meteor.Collection("Cities");
// City:
  // fAddr
  // algoAreaID
  // googRef

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

  // Reference Data
  Meteor.publish('Cities', function () {
    return Cities.find();
  });
  Meteor.publish('AlgoAreas', function () {
    return AlgoAreas.find();
  });
}

// Set up client-size document subscriptions
if (Meteor.is_client) {
  Meteor.subscribe('listings');
  Meteor.subscribe('users'); // TODO: Push all user logic to server-side, set up auth.

  Meteor.subscribe('properties');
  Meteor.subscribe('availabilities');
  Meteor.subscribe('querycache');

  // Reference Data
  Meteor.subscribe("Cities");
  Meteor.subscribe("AlgoAreas");

  // Admin Data
  Meteor.subscribe('visitors'); 
  Meteor.subscribe('AdminSettings');
}

function rebuildAlgoRefData ()
{
  Meteor.call("algoFetchRefStates", function (status, result) {
    var states = xml2json(result);

    // For all states
    for (var i = 0; i < states.areas.area.length; i++) {
      var stateID = states.areas.area[i]["area-id"];

      // Create State Object, if needed
      if (AlgoAreas.findOne({areaID: stateID})) {
        // TODO: Get state info, recurse build up cities
      } else {
        Meteor.call("algoFetchRefAreaDetail", stateID, function (status, result) {
          var state = xml2json(result);
          var stateName = state.area.descriptions[1].text;


          // Look up state's cities
          Meteor.call("algoFetchRefCitiesByState", stateID, function (status, result) {
            var cities = xml2json(result);
            
            // For all cities
            for (var j = 0; j < cities.areas.area.length; j++) {
              var cityID = cities.areas.area[j]["area-id"];

              // Get city's name
              Meteor.call("algoFetchRefAreaDetail", cityID, function (status, result) {
                var city = xml2json(result);
                var cityName = state.area.descriptions[1].text;

                // Build Object if it doesn't already exist
                // if (AlgoAreas)
                // TODO


              });
            }

          });

        });
      }

    } // for all states


    Meteor.call("algoFetchRefAreaDetail", areaid, function (status, result) {
      window.b = result;
      window.c = xml2json(window.b);
    });
  });

};

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
