Template.loginForm.events = {
  'click #loginWithEmailButton': function (evt) {
    evt.preventDefault();

    var inputs = $('#loginForm :input');
    var userID = $(inputs[0]).val();
    var userPassword = $(inputs[1]).val();

    // TODO: Actually attempt to authenticate the user
    if (Users.find({id: userID}).count() == 0) {
      Users.insert({id: userID, password: userPassword});
    }

    // Update the session state
    Session.set("userID", userID);
    console.log(userPassword);

    App.dismissLogin();
  }
}