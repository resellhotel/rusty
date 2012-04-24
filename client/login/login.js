Template.loginForm.events = {
  'click #loginWithEmailButton': function (evt) {
    evt.preventDefault();

    var inputs = $('#loginForm :input');
    var userID = $(inputs[0]).val();
    var userPassword = $(inputs[1]).val();

    App.login(userID, userPassword);
    // TODO: Pass in a callback to login to handle what happens on success/failure.
  }
}