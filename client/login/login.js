Template.loginForm.events = {
  'click #loginWithEmailButton': function (evt) {
    evt.preventDefault();

    var form = $('#loginForm').serializeArray();
    var userID = form[0]["value"];
    var userPassword = form[1]["value"];

    App.login(userID, userPassword);
    // TODO: Pass in a callback to login to handle what happens on success/failure.
  }
}