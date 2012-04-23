AnonListings = new Meteor.Collection("anonListings");
Visitors = new Meteor.Collection("visitors");

// Set up server-side document publishes
if (Meteor.is_server) {
  Meteor.publish('anonListings', function () {
    return AnonListings.find();
  });
  Meteor.publish('visitors', function () {
    return Visitors.find();
  });
}

// Set up client-size document subscriptions
if (Meteor.is_client) {
  Meteor.subscribe('anonListings');
  // Admin Data
  Meteor.subscribe('visitors'); 
}