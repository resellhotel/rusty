Meteor.methods({
  createUser: function(user) {
    if (!user)
      throw new Meteor.Error(1, "Must pass in user object.");

    var now = Clock.now();
    _.extend(user, {
      listings: [],
      when: now,
      lastLogin: now
    });

    var id = Users.insert(user);
    return id;
  },
  createListing: function(listing) {    
    listing = listing ? listing : {};

    _.extend(listing, {
      checkinDate: Clock.today(),
      checkoutDate: Clock.tomorrow()
    });

    var id = Listings.insert(listing);
    return id;
  },
  addListing: function(userID, listingID) {
    var val = {};
    val["listings"] = listingID;
    Users.update({_id: userID}, {$addToSet: val});
    return true;
  }
});