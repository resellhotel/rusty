Template.uploadReservationButton.events = {
  'mousedown': function (evt) {
    if (App.isLoggedIn()) {
      var listingID = Session.get('anonListingID');
      var userID = Session.get('userID');
      App.attachListingToUser(listingID, userID);
    } else {
      App.promptLogin("You'll need to login (or create an account) first before you can upload a reservation.");
    }
  }
};