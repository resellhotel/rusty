Template.uploadReservationButton.events = {
  'mousedown': function (evt) {
    App.attachListingToUser(attachListingToUserCallback);
  }
};

function attachListingToUserCallback (error, result) {
  // TODO: Dismiss any spinnies.

  // On success, show the new listing in the account section, otherwise report an error.
  if (!error) {
    Router.navigate("/account/listings/"+result.listingID, true);
  } else {
    console.log(error);
    console.log(result);
    alert("Uh oh, there was an error uploading your reservation. Please try again and/or let us know.");
  }
}