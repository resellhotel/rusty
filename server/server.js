// --- Models ---
AnonListings = new Meteor.Collection("anonListings");
Meteor.publish('anonListings', function () {
  return AnonListings.find();
});

Meteor.startup(function () {
});
