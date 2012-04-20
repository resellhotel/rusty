Template.big_buy_button.events = {
  'mousedown': function (evt) { // select list
    Router.navigate("buy", true);
  }
};

Template.big_sell_button.events = {
  'mousedown': function (evt) { // select list
    Router.navigate("sell", true);
  }
};