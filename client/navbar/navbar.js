var navs = [{type: "link", section: "sell", name: "Sell"},
            {type: "link", section: "buy", name: "Buy"},
            {type: "link", section: "account", name: "Account"}];

var subnavSets = {
  buy: [{type: "input", id: "city", name: "City"},
        {type: "input", id: "state", name: "State"},
        {type: "date", id: "checkin", name: "Checkin Date"},
        {type: "date", id: "checkout", name: "Checkout Date"}],

  account: [{type: "link", section: "account", subsection: "listings", name: "Listings"},
            {type: "link", section: "account", subsection: "history", name: "History"},
            {type: "link", section: "account", subsection: "profile", name: "Profile"}]
}

Template.navbar.navs = function () {
  return navs;
};

Template.subnav.subnavs = function () {
  return subnavSets[Session.get("currentSection")];
};

Template.navbar_item.active = function () {
  return Session.equals('currentSection', this.section) ? 'active' : '';
};

Template.navbar_item.type_is = function (type) {
  return this.type == type;
};

Template.navbar_item.events = {
  'mousedown': function (evt) {
    if (this.type == "link")
      Router.goTo(this.section, this.subsection);
  }
};

Template.login_button.logged_in = function () {
  return !Session.equals("username", null);
};

Template.login_button.username = function () {
  return Session.get("username");
};

Template.brand_logo.events = {
  'mousedown': function (evt) { // select list
    Router.goTo("home");
  }
};
