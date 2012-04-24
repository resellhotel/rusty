Template.uploadReservationButton.events = {
  'mousedown': function (evt) {
    if (App.isLoggedIn()) {
      // TODO: Attach this reservation to this user.
    } else {
      App.promptLogin("In order to upload a reservation, please login or create a new account.");
    }
  }
};