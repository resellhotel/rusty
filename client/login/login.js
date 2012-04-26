Template.loginForm.events = {
  'click #loginWithEmailButton': function (evt) {
    evt.preventDefault();

    var form = $('#loginForm').serializeArray();
    var email = form[0]["value"];
    var password = form[1]["value"];

    App.login(email, password);
    // TODO: Pass in a callback to login to handle what happens on success/failure.
  }
}