// TODO: Modify this list if the user is logged in.
Template.navbar.navs = [{id: "sell", name: "Sell"}, {id: "buy", name: "Buy"}, {id: "account", name: "Account"}];

Template.navbar_item.active = function () {
  return Session.equals('current_nav', this.name) ? 'active' : '';
};

Template.navbar_item.events = {
  'mousedown': function (evt) { // select list
    Router.navigate(this.id, true);
  }
};

Template.brand_logo.events = {
  'mousedown': function (evt) { // select list
    Router.navigate("/", true);
  }
};

Template.navbar.needs_subnav = function () {
  return Session.equals("current_nav", "buy") || Session.equals("current_nav", "account");
};

Template.subnav.subnavs = function () {
  var subnavs = [];
  if (Session.equals("current_nav", "buy")) {
    // TODO: These are navs but instead form elements, change this.
    subnavs = [{id: "city", name: "City"}, {id: "state", name: "State"}, {id: "checkin", name: "Checkin Date"}, {id: "checkout", name: "Checkout Date"}];
  } else if (Session.equals("current_nav", "account")) {
    subnavs = [{id: "account/listings", name: "Listings"}, {id: "account/history", name: "History"}, {id: "account/profile", name: "Profile"}];
  }
  return subnavs;
}