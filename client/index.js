// Default session data
Session.set('current_nav', "home");
Session.set('current_mode', "showHome");

var modes = ["showHome", "showSell", "showBuy", "showAnonListing", "showAccount", "showAdmin"];

Template.content.mode_is = function (mode) {
  return Session.equals("current_mode", mode);
};