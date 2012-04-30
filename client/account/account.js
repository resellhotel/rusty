Template.account.view_is = function (view) {
  return Session.equals("view", view);
};

Template.accountListings.listings = function () {
  if (!App.isLoggedIn())
    return [];

  var userID = Session.get("userID");
  var listingIDs = Users.findOne({_id: userID}).listings;
  return Listings.find({_id: { $in : listingIDs}});
};

Template.listingDetail.pre = function () {
  var listing = Listings.findOne({_id: Session.get('listingID')});
  _.extend(Template.listingDetail, listing);
}
