// Default session data
Session.set("accountNav", "listings");
Session.set("accountView", "showListings");

var accountNavs = ["profile", "history", "listsings"];
var accountViews = ["showProfile", "showHistory", "showListings"];

Template.accountContent.viewIs = function (view) {
  return Session.equals("accountView", view);
};
