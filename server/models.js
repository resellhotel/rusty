QueryCache = new Meteor.Collection("querycache");

// AdminSettings = new Meteor.Collection("AdminSettings");
Meteor.publish('AdminSettings', function () {
  return AdminSettings.find();
});