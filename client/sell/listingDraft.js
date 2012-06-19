Template.reservationInfoForm.init = function () {
  Meteor.flush();
  // TODO: Figure out why this timeout and fluhses are needed, remove those hacks.

  Meteor.setTimeout(function () {
    Meteor.flush();
    var listingID = Session.equals("mode", "sell") ? Session.get('listingDraftID') : Session.get('listingID');
    var listing = Listings.findOne({_id: listingID});

    // Init Inputs
    var ids = ['checkinDate', 'checkoutDate', 'confirmationNumber', 'confirmationSource', 'hotelName', 'hotelCity', 'price'];
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

        $(sel+'Picker').datepicker({ format: 'mm/dd/yyyy'}).on('changeDate', function (evt){
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

    // Initial City/State Autocomplete
    var cityInput = $('#hotelCity')[0];
    var options = {
      types: ['(cities)'],
      componentRestrictions: {country: 'us'}
    };
    var cityAC = new google.maps.places.Autocomplete(cityInput, options);
    google.maps.event.addListener(cityAC, 'place_changed', function() {
      var place = cityAC.getPlace();
      console.log(place);

      // Show City on the Map
      var el = $("#hotelPickerMap");
      if (!window.listingDraftMap1) {
        window.listingDraftMap1 = new google.maps.Map(el[0], {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: place.geometry.location,
          zoom: 12
        });
      } else {
        if (place.geometry.viewport) {
           window.listingDraftMap1.fitBounds(place.geometry.viewport);
        } else {
          window.listingDraftMap1.setCenter(place.geometry.location);
          window.listingDraftMap1.setZoom(12);
        }
      }

      window.serviceRequest = {
        bounds: place.geometry.viewport,
        types: ["lodging"]
      };

      // Bootstrap Hotel Result List 
      window.listingDraftMap1Service = new google.maps.places.PlacesService(window.listingDraftMap1);
      window.listingDraftMap1Service.search(serviceRequest, compileHotelCandidates);

      // Initialize HotelName Autocomplete based off City/State
      // 1) Initialize bootstrap typeahead for hotelName
      // 2) Set source of typeahead to list of hotelnames for that city/state
      // 3) But we need ANY hotel, right? How do we look that up via google places and moreover, how to validate?
    });
    
    // Init Hotel Name Typeahead
    window.hotelCandidatesByName = {};
    window.hotelCandidateNames = [];
    window.hotelCandidateTypeahead = $('#hotelName').typeahead({ source: window.hotelCandidateNames });
    $('#hotelName').change(function () {
      console.log("changed hotel!");
      var name = $(this).val();
      var hotel = window.hotelCandidatesByName[name];
      Session.set("CurrentHotelCandidate", window.hotelCandidatesByName[name]);

      if (!hotel) {
        alert("Could not find a hotel by that name.");
        return;
      }
    });

  }, 500);
};

Template.hotelPicker.hotelName = function ()
{
  var hotel = Session.get("CurrentHotelCandidate");
  if (hotel)
    return hotel["name"];
  return "";
};
Template.hotelPicker.hotelAddress = function ()
{
  var hotel = Session.get("CurrentHotelCandidate");
  if (hotel)
    return hotel["vicinity"];
  return "";
};
Template.hotelPicker.hotelImgURL = function ()
{
  return "http://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png";
};


function compileHotelCandidates(results, status) {
  window.hotelCandidatesByName = {};
  window.hotelCandidateNames = [];

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      window.hotelCandidateNames.push(place.name);
      window.hotelCandidatesByName[place.name] = place;
    }
  } else {
    console.log("Starter Hotel List Query Failed");
    console.log(status);
  }

  window.hotelCandidateTypeahead.data('typeahead').source = window.hotelCandidateNames;
};

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
var listingDraftGuys = ['#confirmationNumber', '#confirmationSource', '#hotelName', '#hotelCity', '#price'];

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

