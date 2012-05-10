Template.reservationInfoForm.init = function () {
  Meteor.flush();
  // TODO: Figure out why this timeout and fluhses are needed, remove those hacks.

  Meteor.setTimeout(function () {
    Meteor.flush();
    var listingID = Session.get('listingDraftID');
    var listing = Listings.findOne({_id: listingID});

    // Init Inputs
    var ids = ['checkinDate', 'checkoutDate', 'confirmationNumber', 'confirmationSource', 'hotelName', 'hotelCity', 'hotelState', 'price'];
    _.each(ids, function (id) {
      var sel = '#'+id;
      var startVal = listing[id];
      $(sel).val(startVal);
      $(sel).click(function (e) {
        e.preventDefault();
        $(sel+'Picker').datepicker('show');
      });

      var dp = $(sel+'Picker');
      if (dp) {
        dp.data('date', startVal);

        $(sel+'Picker').datepicker({ format: 'mm-dd-yyyy'}).on('changeDate', function (evt){
          // TODO: Validate the change.

          // Update the listing draft
          var o = {};
          o[id] = $(sel).val();
          Listings.update({_id: listingID}, {$set: o});

          // Dismiss the picker
          $(sel+'Picker').datepicker('hide');
        }); //onchange
      }
    });

  }, 500);
}

// TODO: Add in alerts to the above using below example
// $('#checkinDatePicker').datepicker().on('changeDate', function(ev){
//   var listingID = Session.get('listingDraftID');

//   // Validate date change
//   if (ev.date.valueOf() > endDate.valueOf()){
//     // TODO: add this and below: $('#alert').show().find('strong').text('The start date can not be greater then the end date');
//   } else {
//     // $('#alert').hide();

//     startDate = new Date(ev.date);
//     $('#checkinDate').text($('#dp4').data('date'));
//   }
//   $('#checkinDatePicker').datepicker('hide');
// });


Template.uploadReservationButton.events = {
  'click': function (evt) {
    evt.preventDefault();
    Meteor.flush(); // Ensure that the listing draft is saved
    App.uploadListing();
  }
};


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
FormGuy.make_onchange_handler = function (options) {
  var change = options.change || function () {};

  return function (evt) {
    alert("change happened");
    change.call(this, evt.target, evt);
  };
};

// Set up ok-cancel events on listing draft inputs
Template.listingDraft.events = {};
var listingDraftGuys = ['#confirmationNumber', '#confirmationSource', '#hotelName', '#hotelCity', '#hotelState', '#price'];

Template.listingDraft.events[ FormGuy.okcancel_events(listingDraftGuys) ] =
  FormGuy.make_okcancel_handler({
    ok: function (input, evt) {
      var listingID = Session.get('listingDraftID');
      var val = {};
      val[input.name] = input.value;
      Listings.update({_id: listingID}, {$set: val});
    }
  });


