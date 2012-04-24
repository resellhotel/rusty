Template.big_buy_button.events = {
  'mousedown': function (evt) { // select list
    Router.goTo("buy");
  }
};

Template.big_sell_button.events = {
  'mousedown': function (evt) { // select list
    Router.goTo("sell");
  }
};