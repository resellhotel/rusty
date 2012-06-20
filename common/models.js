Listings = new Meteor.Collection("listings");
Users = new Meteor.Collection("users");

Availabilities = new Meteor.Collection("availabilities");
Properties = new Meteor.Collection("properties");

// Caches
QueryCache = new Meteor.Collection("querycache");
DataSources = new Meteor.Collection("datasources");

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

  // Caches
  Meteor.publish('querycache', function () {
    return QueryCache.find();
  });
  Meteor.publish('datasources', function () {
    return DataSources.find();
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

  // Caches
  Meteor.subscribe('querycache');
  Meteor.subscribe('datasources');

  // Reference Data
  Meteor.subscribe("Cities");
  Meteor.subscribe("AlgoAreas");

  // Admin Data
  Meteor.subscribe('visitors'); 
  Meteor.subscribe('AdminSettings');
}

// --------- REBUILD City Data -------- //
function rebuildCities()
{
  console.log("Rebuilding cities!");

  // Create all necessary cities
  AlgoAreas.find({type: "city"}).forEach(createCity);

  // Create Data Source for city list
  console.log("Rebuilding City Source List!");
  window.CitySourceList = Cities.find().map(function (city) {
    return city.algoName;
  });
};

function createCity(city)
{
  var areaID = city.areaID;

  if (Cities.findOne({algoAreaID: areaID})) {
    console.log("Already had a City with areaID: "+areaID);
    return;
  }

  var algoName = city.name + ", " + city.stateName;
  Cities.insert({
    algoAreaID: areaID,
    algoName: algoName
  });
};

function geocodeCity(city)
{
  if (Meteor.is_client && window && !window.geocoder)
    window.geocoder = new google.maps.Geocoder();
  if (Meteor.is_server && !geocoder)
    geocoder = new google.maps.Geocoder();

  var where = city.algoName;
  if (!where) {
    console.log("City is missing field algoName");
    return;
  }

  geocoder.geocode({'address': where}, function (geocodes, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var fAddr = geocodes[0].formatted_address;
      Cities.update({ algoAreaID: city.algoAreaID }, {$set : {fAddr: fAddr}});
    } else {
      console.log("Geocoder failed on createCity for Algo city with ID: "+city.algoAreaID);
    } 
  });
};


// ------ REBUILD Algo Reference Data ------- //
function algoRebuildStates ()
{
  Meteor.call("algoFetchRefStates", function (status, result) {
    var json = xml2json_Algo(result);
    var states = json.areas.area;

    // For all states
    for (var i = 0; i < states.length; i++) {
      var stateID = states[i]["area-id"];

      // Create State Object, if needed
      if (AlgoAreas.findOne({areaID: stateID}))
        continue;

      algoRebuildState(states[i]["area-id"]);
    } // for i

  }); // Meteor.call
};

function algoRebuildState(stateID)
{
  // Fetch State details and insert it!
  Meteor.call("algoFetchRefAreaDetail", stateID, function (status, result) {
      var json = xml2json_Algo(result);
      var stateName = json.area.descriptions.description[1].text;

      if (stateName.length != 2) {
        console.log("Algo State Name wasn't abbr, but instead was: "+stateName+". Ignoring it.");
        return;
      }

      if (AlgoAreas.findOne({areaID: stateID})) {
        console.log("Already had state with areaID: "+stateID);
        return;
      }

      var state = {
        type: "state",
        areaID: stateID,
        name: stateName
      };
      AlgoAreas.insert(state);
  }); // Meteor.call
};

function algoRebuildCities ()
{
  var states = AlgoAreas.find({type: "state"}).fetch();

  // For each state, look up its cities
  for (var i = 0; i < states.length; i++) {
    console.log("Rebuilding city list for state: "+states[i].name);
    algoRebuildCitiesByState(states[i]);
  } // for i
};

function algoRebuildCitiesByState (state)
{
  // Fetch city list
  Meteor.call("algoFetchRefCitiesByState", state.areaID, function (status, result) {
    var cities = xml2json_Algo(result).areas.area;

    // For all cities, fetch their data if they're not already present
    for (var j = 0; j < cities.length; j++) {
      var cityID = cities[j]["area-id"];

      if (AlgoAreas.findOne({areaID: cityID})) {
        console.log("Already had city with areaID: "+cityID);
        continue;
      }

      algoRebuildCity(cities[j]["area-id"], state);
    } // Meteor.call (algoFetchRefAreaDetail)

  }); // Meteor.call (algoFetchRefCitiesByState)
};

function algoRebuildCity (cityID, state)
{
  console.log("Fetching details for city with areaID: "+cityID);

  Meteor.call("algoFetchRefAreaDetail", cityID, function (status, result) {
    var json = xml2json_Algo(result);
    var cityName = json.area.descriptions.description[1].text;

    if (AlgoAreas.findOne({areaID: cityID})) {
      console.log("Already had city with areaID: "+cityID);
      return;
    }

    var city = {
      type: "city",
      areaID: cityID,
      name: cityName,
      stateName: state.name
    };
    console.log("Inserting record for "+cityName+", "+state.name);
    AlgoAreas.insert(city);
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
