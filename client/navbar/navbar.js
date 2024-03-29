// --- Navbar ----
Template.navbar.navs = function () {
  if (Session.equals("isAdmin", true)) {
    return [{type: "link", id: "sell", name: "Sell"},
          {type: "link", id: "buy", name: "Buy"},
          {type: "link", id: "account", name: "Account"},
          {type: "link", id: "admin", name: "Admin"}];
  } else {
    return [{type: "link", id: "sell", name: "Sell"},
          {type: "link", id: "buy", name: "Buy"},
          {type: "link", id: "account", name: "Account"}];
  }
}

// --- Navbar Item ---

Template.navbar_item.active = function () {
  return Session.equals('mode', this.id) ? 'active' : '';
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


// --- Sub Navbar ---
Template.subnav.subnavs = function () {
  var subnavs = [];
  if (Session.equals("mode", "buy")) {
    // TODO: These are navs but instead form elements, change this.
    subnavs =[{type: "input", id: "where", name: "Where"},
              {type: "date", id: "checkin", name: "Checkin"},
              {type: "date", id: "checkout", name: "Checkout"},
              {type: "select", id: "rooms", options: [{name:"1 room"}, {name:"2 rooms"}, {name:"3 rooms"}, {name:"4 rooms"}] },
              {type: "select", id: "guests", options: [{name:"1 guest"}, {name:"2 guests"}, {name:"3 guests"}, {name:"4 guests"}] }
    ];
  } else if (Session.equals("mode", "account")) {
    subnavs =[{type: "link", id: "account/listings", name: "Listings"},
              {type: "link", id: "account/history", name: "History"},
              {type: "link", id: "account/profile", name: "Profile"}
    ];
  }
  return subnavs;
}

// --- Sub Navbar Item ---

Template.subnavbar_item.active = function () {
  return Session.equals('view', this.id) ? 'active' : '';
};

Template.subnavbar_item.type_is = function (type) {
  return this.type == type;
};

Template.subnavbar_item.events = {
  'mousedown': function (evt) {
    if (this.type == "link")
      Router.navigate(this.id, true);
  }
};


// --- Brand Logo ---
Template.brand_logo.events = {
  'mousedown': function (evt) { // select list
    Router.navigate("/", true);
  }
};
