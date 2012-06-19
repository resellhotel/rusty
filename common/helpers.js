// Google Maps v3 helper functions
function iconImageURL(hexColor) {
  return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + hexColor;
};

// Simple XML to JSON parser
// Returns {tag1: [{attributes: {}, childNodes: {}}, {attributes: {}, childNodes: {}, etc], 
//          tag2: [{attributes: {}, childNodes: {}}], 
//          etc.}
// attributes or childNodes may be null.
function xml2json(xml) {

  function getAttributes(openingTag) {
    var attrArr = openingTag.match(/(?:\s+([\w-]+)\s*="([\w-]+)")+/);

    // Didn't find any pairs of attributes
    if (!attrArr || attrArr.length < 3)
      return;

    var attrs = {}
    for (var i = 1; i < attrArr.length - 1; i += 2) {
      var attrName = attrArr[i];
      var attrVal = attrArr[i + 1];
      attrs[attrName] = attrVal;
    }
    return attrs;
  }

  function getOpeningTag(xml) {
    var openingTag = xml.match(/\s*<[^\/][^>]+>\s*/);
    if (!openingTag || !openingTag.length)
        return null;
    return openingTag[0];
  }

  function lastIndexOfClosingTag(xml, openingTag) {
    var tagName = openingTag.match(/<([\w-]+)/)[1];
    if (!tagName)
      return -1;
    return xml.lastIndexOf("</" + tagName + ">");
  }

  function isSelfClosingTag(openingTag) {
    return openingTag.search("/>") != -1;
  }

  function getDataIfDataTag(openingTag) {
    var data = openingTag.match(/^\s*<\!\[CDATA\[(.*)\]\]>\s*$/);
    if (data && data.length > 1)
      return data[1];
  }

  var data = null;

  while (1) {
    // Assume there exists a well-formed tag to parse
    var openingTag = getOpeningTag(xml);
    
    if (!openingTag) {
      // Reached end of this scope, return all parsed data
      if (data)
        return data;
      else // At a leaf node, return raw data
        return xml;
    }

    // If this is raw data, just return it.
    var data = getDataIfDataTag(openingTag);
    if (data)
      return data;

    if (openingTag.search("<?xml") != -1)
      return xml2json(xml.substring(openingTag.length));

    if (!data)
      data = {};

    var name = openingTag.match(/<([\w-]+)/)[1];

    if (!data[name])
      data[name] = [];

    var nodeObj = {attributes: getAttributes(openingTag)};

    var selfClosing = isSelfClosingTag(openingTag);
    var closingTagPosition = selfClosing ? openingTag.length : lastIndexOfClosingTag(xml, openingTag);
    if (!selfClosing) {
      if (!closingTagPosition) {
        console.error("Malformed: opening tag " + openingTag + "has no closing tag");
        constinue;
      } 
      nodeObj.childNodes = xml2json(xml.substring(openingTag.length, closingTagPosition));
    }

    data[name].push(nodeObj);
    xml = xml.substring(closingTagPosition);
  }

  // Should never reach this point...
  console.error("xml2json: should never be reached");

}; // END xml2json

// Simple XML to JSON parser
function xml2json_GetARoom(xml) {
  // At a leaf node, return data
  if (xml.indexOf("<") == -1)
    return xml;

  var headerL = xml.indexOf("<?xml");
  if (headerL != -1) {
    var headerR = xml.indexOf(">", headerL);
    var xmlbody = xml.substring(headerR+1);
    return xml2json(xmlbody);
  }

  var data = {};
  var startL = 0, startR = 0, endL = 0, endR = -1;

  while (1) {
    // No more tags to process
    if (xml.indexOf("<", endR+1) == -1)
      return data;

    // Assume there exists a well-formed tag to parse
    startL = xml.indexOf("<", endR+1);
    startR = xml.indexOf(">", endR+1);
    if (xml.charAt(startR-1) == "/")
      return xml.substring(startL+1, startR-1);

    var tagname = xml.substring(startL+1, startR).split(" ")[0];
    var endtag = "</"+tagname+">";
    endL = xml.indexOf(endtag, startR);
    endR = endL + endtag.length;

    var innerXML = xml.substring(startR+1, endL);
    if (data[tagname]) {
      if (!data[tagname].length) {
        var o = data[tagname];
        data[tagname] = [];
        data[tagname].push(o);
      }
      data[tagname].push(xml2json(innerXML));
    } else {
      data[tagname] = xml2json(innerXML);
    }
  }

  // Should never reach this point...
  return data;
}; // END xml2json

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
  return pad2(d.getMonth()+1)+"/"+pad2(d.getDate())+"/"+d.getFullYear();
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

var initDatePicker = function (id, value, onSelect)
{
  initWhenReady(id, function () {
    var dp = $('#'+id);
    dp.keydown(function (e) {e.preventDefault();});
    if (value) dp.val(value);
    dp.datepicker({ format: 'mm/dd/yyyy'}).on('changeDate', function (evt) {
      // TODO: Ideally, validate the change here.
      dp.datepicker('hide');
      if (onSelect) onSelect();
    });
  });
};
