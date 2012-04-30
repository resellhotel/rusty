Listings = new Meteor.Collection("listings");
Users = new Meteor.Collection("users");
Visitors = new Meteor.Collection("visitors");

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
}

// Set up client-size document subscriptions
if (Meteor.is_client) {
  Meteor.subscribe('listings');
  Meteor.subscribe('users'); // TODO: Push all user logic to server-side, set up auth.

  // Admin Data
  Meteor.subscribe('visitors'); 
}