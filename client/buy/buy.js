Template.BuyNavbar.subnavs = function () {
  var subnavs = [];
  subnavs =[{type: "input", id: "where", name: "Where"},
            {type: "date", id: "checkin", name: "Checkin"},
            {type: "date", id: "checkout", name: "Checkout"},
            {type: "select", id: "rooms", options: [{name:"1 room"}, {name:"2 rooms"}, {name:"3 rooms"}, {name:"4 rooms"}] },
            {type: "select", id: "guests", options: [{name:"1 guest"}, {name:"2 guests"}, {name:"3 guests"}, {name:"4 guests"}] }
  ];
  return subnavs;
}

Template.BuyNavbarItem.active = function () {
  return Session.equals('view', this.id) ? 'active' : '';
};

Template.BuyNavbarItem.type_is = function (type) {
  return this.type == type;
};

Template.BuyNavbarItem.events = {
  'mousedown': function (evt) {
    if (this.type == "link")
      Router.navigate(this.id, true);
  }
};