var sections = ["home", "buy", "sell", "account", "admin"];
var subsections = {
  sell : ["", "listings"],
  account : ["profile", "listings", "history"],
  admin : ["visitors"]
};

// Default routes
var RustyRouter = Backbone.Router.extend({
  routes: {
    "sell/listings/:listing_id": "anonListing",
    ":section/:subsection": "default",
    ":section": "default",
    "*splat": "default"

    // "" : "home",
    // "buy" : "buy",
    // "sell" : "sell",
    // "sell/listings" : "anonListing",
    // "sell/listings/:listing_id" : "anonListing",
    // "account" : "account",
    // "account/listings" : "accountListings",
    // "account/profile" : "accountProfile",
    // "account/history" : "accountHistory",
    // "admin" : "admin"
  },
  default: function (section, subsection) {
    if (!section) section = "";
    if (!subsection) subsection = "";

    console.log("section: "+section+", subsection: "+subsection);

    if (_.include(sections, section)) {
      Session.set("currentSection", section);
      if (_.include(subsections[section], subsection))
        Session.set(section+"Section", subsection);
    }
  },
  goTo: function (section, subsection) {
    var path = "";
    if (section)
      path = section + (subsection ? "/"+subsection : "");
    Router.navigate(path, true);
  },


  // home: function () {
  //   Session.set("current_nav", "home");
  //   Session.set("current_mode", "showHome");
  // },
  // buy: function () {
  //   Session.set("current_nav", "buy");
  //   Session.set("current_mode", "showBuy");

  //   Meteor.setTimeout(function () {
  //     $('#dp-buy-checkin').datepicker({ format: 'mm-dd-yyyy'});
  //     $('#dp-buy-checkout').datepicker({ format: 'mm-dd-yyyy'});
  //   }, 1000);
  // },
  // sell: function () {
  //   Session.set("current_nav", "sell");
  //   Session.set("current_mode", "showSell");
  // },
  // account: function () {
  //   Session.set("current_nav", "account");
  //   Session.set("current_mode", "showAccount");
  // },
  // accountListings: function () {
  //   Session.set("current_nav", "account");
  //   Session.set("current_mode", "showAccount");
  //   Session.set("accountNav", "listings");
  //   Session.set("accountView", "showListings");
  // },
  // accountHistory: function () {
  //   Session.set("current_nav", "account");
  //   Session.set("current_mode", "showAccount");
  //   Session.set("accountNav", "history");
  //   Session.set("accountView", "showHistory");
  // },
  // accountProfile: function () {
  //   Session.set("current_nav", "account");
  //   Session.set("current_mode", "showAccount");
  //   Session.set("accountNav", "profile");
  //   Session.set("accountView", "showProfile");
  // },
  // admin: function () {
  //   Session.set("current_nav", "admin");
  //   Session.set("current_mode", "showAdmin");
  // },
  anonListing: function (listing_id) {
    Session.set("currentSection", "sell");

    if (listing_id) {
      Session.set("listing_id", listing_id);
      Session.set("currentSection", "sell");
      Session.set("sellSection", "listings");

      // Initialize Datepickers, TODO: tie this to their template's generation
      Meteor.setTimeout(function () {
        $('#dp1').datepicker({ format: 'mm-dd-yyyy'});
        $('#dp2').datepicker({ format: 'mm-dd-yyyy'});
      }, 1000);
      return;
    }

    var id = Session.equals("listing_id", null) ? AnonListings.insert({}) : Session.get("listing_id");
    this.navigate("/sell/listings/"+id, true);
  }
});
Router = new RustyRouter;
