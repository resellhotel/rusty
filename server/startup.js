// Default Session State
Session.set("AdminPassword", "14f2a2a3-21ff-409a-84ae-727334aaf34e");

// ---- Server Startup Routines ---- //
Meteor.startup(function () {
  // Initialze Default Debug Settings
  if (!AdminSettings.findOne({name: "debug"})) {
    var debugSetting = {
      name: "debug",
      enabled: true
    };
    AdminSettings.insert(debugSetting);
  }
});
