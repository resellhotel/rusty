Template.reservationInfoForm.init = function () {
  initDatePicker('checkinDate', '07/07/2012');
  initDatePicker('checkoutDate', '07/08/2012');

  var listingID = Session.equals("mode", "sell") ? Session.get('listingDraftID') : Session.get('listingID');
  var listing = Listings.findOne({_id: listingID});

  if (!listing)
    return;

  // Init Inputs
  var ids = ['confirmationNumber', 'confirmationSource', 'hotelName', 'hotelCity', 'hotelState', 'price'];
  _.each(ids, function (id) {
    var startVal = listing[id];
    var sel = '#'+id;
    $(sel).val(startVal);
  });
};

  // var dp = $(sel+'Picker');

  // if (dp && dp.length) {
  //   $(sel).click(function (e) {
  //     e.preventDefault();
  //     $(sel+'Picker').datepicker('show');
  //   });

  //   $(sel).val(startVal);
  //   dp.data('date', startVal);

  //   $(sel+'Picker').datepicker({ format: 'mm/dd/yyyy'}).on('changeDate', function (evt){
  //     // TODO: Validate the change.

  //     // Update the listing draft
  //     var o = {};
  //     o[id] = $(sel).val();
  //     Listings.update({_id: listingID}, {$set: o});

  //     // Dismiss the picker
  //     $(sel+'Picker').datepicker('hide');
  //   }); //onchange
  // } else {

Template.listingDraft.mode_is = function (mode) {
  return Session.equals("mode", mode);
};

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

// Set up ok-cancel events on listing draft inputs
Template.listingDraft.events = {};
var listingDraftGuys = ['#confirmationNumber', '#confirmationSource', '#hotelName', '#hotelCity', '#hotelState', '#price'];

Template.listingDraft.events[ FormGuy.okcancel_events(listingDraftGuys) ] =
  FormGuy.make_okcancel_handler({
    ok: function (input, evt) {
      var listingID = Session.equals("mode", "sell") ? Session.get('listingDraftID') : Session.get('listingID');
      var val = {};
      val[input.name] = input.value;
      Listings.update({_id: listingID}, {$set: val});
    }
  });

Template.listingDraft.events['click #uploadReservationButton'] = function (evt) {
  evt.preventDefault();
  Meteor.flush(); // Ensure that the listing draft is saved
  App.uploadListing();
};

