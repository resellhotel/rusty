Template.navbar.navs = function () {
  return [{type: "link", id: "sell", name: "Sell"},
          {type: "link", id: "buy", name: "Buy"},
          {type: "link", id: "account", name: "Account"}];
}

Template.navbar_item.active = function () {
  return Session.equals('current_nav', this.name) ? 'active' : '';
};

Template.navbar_item.type_is = function (type) {
  return this.type == type;
};

Template.navbar_item.events = {
  'mousedown': function (evt) {
    if (this.type == "link")
      Router.navigate(this.id, true);
  }
};

Template.login_button.logged_in = function () {
  return !Session.equals("username", null);
}

Template.login_button.username = function () {
  return Session.get("username");
}

Template.subnav.subnavs = function () {
  var subnavs = [];
  if (Session.equals("current_nav", "buy")) {
    // TODO: These are navs but instead form elements, change this.
    subnavs =[{type: "input", id: "city", name: "City"},
              {type: "input", id: "state", name: "State"},
              {type: "date", id: "checkin", name: "Checkin Date"},
              {type: "date", id: "checkout", name: "Checkout Date"}];
  } else if (Session.equals("current_nav", "account")) {
    subnavs =[{type: "link", id: "account/listings", name: "Listings"},
              {type: "link", id: "account/history", name: "History"},
              {type: "link", id: "account/profile", name: "Profile"}];
  }
  return subnavs;
}

Template.brand_logo.events = {
  'mousedown': function (evt) { // select list
    Router.navigate("/", true);
  }
};
