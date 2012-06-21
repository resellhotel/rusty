// Google Maps v3 helper functions
function iconImageURL(hexColor) {
  return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + hexColor;
};

function getAreaIDByFAddr(fAddr)
{
  var city = Cities.findOne({fAddr: fAddr});
  if (!city) {
    console.log("No city found with fAddr: "+fAddr);
    return null;
  }
  return city.algoAreaID;
};

function reverseLookupAreaID (where)
{
  return "19163";

  var chunks = where.split(",");
  var city = chunks[0];
  var state = chunks[1];

  var algoArea = AlgoAreas.findOne({type: "city", name: city});

  if (algoArea && algoArea.areaID)
    return algoArea.algoAreaID;

  console.log("Reverse AreaID Lookup Failed.");
  return null;

  // if (window && !window.geocoder)
  //   window.geocoder = new google.maps.Geocoder();

  // window.geocoder.geocode({'address': where}, function (geocodes, status) {
  //   if (status == google.maps.GeocoderStatus.OK) {
  //     var fAddr = geocodes[0].formatted_address;
  //     var areaID = getAreaIDByFAddr(fAddr);

  //     if (!areaID) {
  //       onerror();
  //       return;
  //     }

  //     fn(areaID);
  //   } else {
  //     console.log("Reverse AreaID Lookup Failed.");
  //   }
  // });
};

function convertToYYYYMMDD (date)
{
  var chunks = date.split("/");
  return chunks[2]+chunks[0]+chunks[1];
};

// Simple XML to JSON parser for Algo.Travel API
function xml2json_Algo(xml) {
  // At a leaf node, return data
  if (xml.indexOf("<") == -1)
    return xml;

  var headerL = xml.indexOf("<?xml");
  if (headerL != -1) {
    var headerR = xml.indexOf(">", headerL);
    var xmlbody = xml.substring(headerR+1);
    return xml2json_Algo(xmlbody);
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
    if (xml.charAt(startR-1) == "/") {
      var meat = xml.substring(startL+1, startR-1);
      var name = meat.split(" ")[0];
      if (!data[name])
        data[name] = [];

      var attr_str = meat.substring(name.length).trim()
      if (attr_str.charAt(attr_str.length-1) == "\"")
        attr_str = attr_str.substring(0, attr_str.length-1);
      var chunks = attr_str.split(/\"\s+/);
      var value = {};
      for (var a = 0; a < chunks.length; a++) {
        var chunk = chunks[a];
        var foos = chunk.split(/\s*=\s*\"/);
        if (foos.length != 2)
          console.log("Oh my foo!");
        value[foos[0]] = foos[1];
      }

      data[name].push(value);
      endR = startR;
      continue;      
    }

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
      data[tagname].push(xml2json_Algo(innerXML));
    } else {
      data[tagname] = xml2json_Algo(innerXML);
    }
  }

  // Should never reach this point...
  return data;
}; // END xml2json_Algo

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
    return xml2json_GetARoom(xmlbody);
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
      data[tagname].push(xml2json_GetARoom(innerXML));
    } else {
      data[tagname] = xml2json_GetARoom(innerXML);
    }
  }

  // Should never reach this point...
  return data;
}; // END xml2json_GetARoom

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
