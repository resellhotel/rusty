Template.navbar.navs = [{id: "sell", name: "Sell"}, {id: "buy", name: "Buy"}];

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
