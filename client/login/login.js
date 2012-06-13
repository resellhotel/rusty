LoginModal = {
  alert: null,
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
};

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

// --- Login/Logout Button ---

Template.loginNav.modeIs = function (mode) {
  return Session.equals("loginMode", mode);
};
Template.loginNav.logged_in = function () {
  return App.isLoggedIn() ? true : false;
};
Template.loginNav.email = function () {
  return App.userEmail();
};

Template.loginNav.events = {
  'click #logoutButton': function (evt) {
    evt.preventDefault();
    App.logout();
  },
  'click #FB_logoutButton': function (evt) {
    evt.preventDefault();
    FB.logout();
  },
  'click #FB_loginButton': function (evt) {
    evt.preventDefault();
    FB.login();
  }
};

Template.loginNav.FB_pic_square = function ()
{
  var user = Session.get("FB_user");
  if (user && user.pic_square) return user.pic_square;
  else return "http://placehold.it/40x40";
};
Template.loginNav.FB_name = function ()
{
  var user = Session.get("FB_user");
  if (user && user.name) return user.name;
  else return "";
};
