LoginModal = {
  alert: "You must log in first.",
  alertType: "error",
  fn: null,
  loginEmail: "",
  loginPass: "",
  loginRemember: false,
  signupEmail: "",
  signupPass: "",

  prompt: function (fn, msg, type) {
    this.fn = fn;
    this.alert = msg;
    this.alertType = type;
    $("#loginModal").modal('show');
  },
  warn: function (msg) {
    this.alert = msg;
    this.alertType = "error";
  },
  submit: function () {
    var form = $('#loginForm').serializeArray();
    this.loginEmail = form[0]["value"];
    this.loginPass = form[1]["value"];
    App.login(this.loginEmail, this.loginPass, this.fn);
  },
  dismiss: function () {
    this.alert = "";
    $("#loginModal").modal('hide');
  }
};
Session.set("LoginModal", LoginModal);

Template.loginForm.events = {
  'click #loginWithEmailButton': function (evt) {
    evt.preventDefault();
    LoginModal.submit();
  }
}

Template.loginModal.hasAlert = function () {
  if (Session.get("LoginModal").alert)
    return true;
  return false;
};
Template.loginModal.alert = function () {
  return Session.get("LoginModal").alert;
};
Template.loginModal.alertType = function () {
  return Session.get("LoginModal").alertType;
};
