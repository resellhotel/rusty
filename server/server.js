// --- Models ---
AnonListings = new Meteor.Collection("anonListings");
Meteor.publish('anonListings', function () {
  return AnonListings.find();
});

Visitors = new Meteor.Collection("visitors");
Meteor.publish('visitors', function () {
  return Visitors.find();
});

Meteor.startup(function () {
});
