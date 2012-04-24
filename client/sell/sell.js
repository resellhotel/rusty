Template.sell.view_is = function (view) {
  return Session.equals("view", view);
};

Template.link_to_anonListing.events = {
  'mousedown': function (evt) { // select list
    Router.anonListing();
  }
};
