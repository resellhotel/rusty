// Default session data
Session.set("accountNav", "listings");
Session.set("accountView", "profile");

var accountNavs = ["profile", "history", "listsings"];
var accountViews = ["showProfile", "showHistory", "showListings"];

Template.accountContent.currentSectionIs = function (section) {
  return Session.equals("accountSection", section); 
}