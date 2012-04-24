Template.link_to_anonListing.events = {
  'mousedown': function (evt) { // select list
    Router.anonListing();
  }
};

Template.sell.currentSectionIs = function (section) {
  return Session.equals("sellSection", section); 
}