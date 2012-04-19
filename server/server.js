// The sections of the site
  // name: String
  // pretty_name: String
Sections = new Meteor.Collection("sections");

Meteor.publish('sections', function () {
  return Sections.find();
});

Meteor.startup(function () {
  var sections = [
    {
      name: "home",
      pretty_name: "Home"
    },
    {
      name : "sell",
      pretty_name : "Sell"
    }, 
    {
      name : "buy",
      pretty_name : "Buy"
    }
  ];

  Sections.insert(sections[0]);
  Sections.insert(sections[1]);
  Sections.insert(sections[2]);
});
