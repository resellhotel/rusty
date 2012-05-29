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

function pad2(num) {
  if (!(typeof num === 'string'))
    num = String(num);
  if (num.length == 1)
    return "0"+num;
  return num;
}
function date2str(d) {
  return pad2(d.getMonth())+"/"+pad2(d.getDate())+"/"+d.getFullYear();
}
Clock.now = function () {
  return (new Date()).getTime();
}
Clock.today = function() {
  var now = new Date();
  return date2str(now);
}
Clock.tomorrow = function() {
  var d = new Date();
  d.setTime(d.getTime() + (1000*3600*24));
  return date2str(d);
}

var initWhenReady = function (id, init)
{
  var timeToRetry = 40; // in ms
  var el = $('#'+id);

  if (!el || !el.length) {
    setTimeout(function () {
      initWhenReady(id, init);
    }, timeToRetry);
    return;
  }

  if (!el[0].inited) {
    console.log("initing");
    init();
    el[0].inited = true;
  }
};

var initDatePicker = function (id, value)
{
  initWhenReady(id, function () {
    var dp = $('#'+id);
    if (value) dp.val(value);
    dp.datepicker({ format: 'mm/dd/yyyy'}).on('changeDate', function (evt) {
      // TODO: Ideally, validate the change here.
      dp.datepicker('hide');
    });
  });
};
