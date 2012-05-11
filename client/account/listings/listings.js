Template.accountListings.listings = function () {
  if (!App.isLoggedIn())
    return [];

  var userID = Session.get("userID");
  var listingIDs = Users.findOne({_id: userID}).listings;
  return Listings.find({_id: { $in : listingIDs}});
};

Template.listingItem.events = {
  'click .update-button' : function (e) {
    Router.navigate("/account/listings/"+this._id, true);
  },
  'click .delete-button' : function (e) {
    Listings.remove({_id: this._id});
  }
};
