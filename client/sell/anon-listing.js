Template.sell.drafts = function () {

  // return {checkoutDate: "05-21-2012"};
  var listingID = Session.get("anonListingID");
  return AnonListings.find({_id: listingID});
}

Template.uploadReservationButton.events = {
  'click': function (evt) {
    evt.preventDefault();
    Meteor.flush(); // Ensure that the listing draft is saved
    App.uploadListing();
  }
};

// TODO: Consider using this?
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






////////// Helpers for in-place editing, from "todos" example //////////
// TODO: Clean this up.
if (typeof FormGuy === "undefined")
  FormGuy = {};

// Returns an event_map key for attaching "ok/cancel" events to a text input (given by selectors)
FormGuy.okcancel_events = function (selector) {
  var list;
  if (typeof selectors === 'string')
    list = [selector];
  else
    list = selector;

  var toEventMap = function (selector) {
    return 'keyup '+selector+', keydown '+selector+', focusout '+selector+', ';
  };

  var map = _.foldl(list, function (memo, selector) {return memo+toEventMap(selector);}, "");
  return map;
};

// Creates an event handler for interpreting "escape", "return", and "blur"
// on a text field and calling "ok" or "cancel" callbacks.
FormGuy.make_okcancel_handler = function (options) {
  var ok = options.ok || function () {};
  var cancel = options.cancel || function () {};

  return function (evt) {
    if (evt.type === "keydown" && evt.which === 27) {
      // escape = cancel
      cancel.call(this, evt);

    } else if (evt.type === "keyup" && evt.which === 13 ||
               evt.type === "focusout") {
      ok.call(this, evt.target, evt);
    }
  };
};



// TODO: Replace dp1/2 with '#checkinDate', '#checkoutDate'
var listingDraftGuys = ['#confirmationNumber', '#confirmationSource', '#dp1', '#dp2', '#hotelName', '#hotelCity', '#hotelState'];

Template.listingDraft.events = {};
Template.listingDraft.events[ FormGuy.okcancel_events(listingDraftGuys) ] =
  FormGuy.make_okcancel_handler({
    ok: function (input, evt) {
      var listingID = Session.get("anonListingID");
      var val = {};
      val[input.name] = input.value;
      AnonListings.update({_id: listingID}, {$set: val});
    }
  });
