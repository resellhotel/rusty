function FB_getAccountInfo ()
{
  FB.api(
    {
      method: 'fql.query',
      query: 'SELECT name, pic_square FROM user WHERE uid='+FB.getUserID()
    },
    function(response) {
      Session.set("loginMode", "logout");
      Session.set("FB_user", response[0]);
    }
  );
};

function FB_watchStatus()
{
  function onStatus(response) {
    if (response.status === 'connected') {
      Session.set("loggedIn", true);
      Session.set("loginMode", "loading");
      FB_getAccountInfo();
    } else {
      Session.set("loggedIn", false);
      Session.set("loginMode", "login");
      Session.set("FB_user", null);
    }
  };

  FB.getLoginStatus(function(response) {
    onStatus(response); // once on page load
    FB.Event.subscribe('auth.statusChange', onStatus); // every status change
  });
};

function initFacebookAPI()
{
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '429503890403122', // App ID
      // channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Initialize Other Stuff
    FB_watchStatus();
  };

  // Load the SDK Asynchronously
  (function(d) {
    console.log("Async Loading Facebook API SDK");
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));
};