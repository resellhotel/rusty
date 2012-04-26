if (typeof Forms === "undefined")
  Forms = {};

// TODO: Remove this?
Forms.toJSON = function(formID) {
  var form = $(formID).serializeArray();
  var json = {};
  for (i in form) {
    var field = form[i];
    json[field["name"]] = field["value"];
  }
  return json;
}



if (typeof Clock === "undefined")
  Clock = {};

// TODO: Implement these forrealz
Clock.now = function () {
  return (new Date()).getTime();
}
Clock.today = function() {
  return "05-21-2012";
}
Clock.tomorrow = function() {
  return "05-22-2012";
}

