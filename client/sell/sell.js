Template.sell.view_is = function (view) {
  return Session.equals("view", view);
};

Template.toListingDraft.events = {
  'mousedown': function (evt) { // select list
    Router.listingDraft();
  }
};
