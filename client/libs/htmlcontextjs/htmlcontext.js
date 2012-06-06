var Area = function (x, y, w, h) {
  if (typeof x == 'number') this.x = [x, 0];
  else this.x = x;
  if (typeof y == 'number') this.y = [y, 0];
  else this.y = y;

  if (typeof w == 'number') this.w = [w, 0];
  else this.w = w;
  if (typeof h == 'number') this.h = [h, 0];
  else this.h = h;
};
Area.prototype.map = function (w, h)
{
  var rect = {};
  rect.w = this.w[0] + (this.w[1] * w);
  rect.h = this.h[0] + (this.h[1] * h);

  if (typeof this.x == "string" && this.x == "c")
    rect.x = w/2 - rect.w/2;
  else
    rect.x = this.x[0] + (this.x[1] * w);

  if (typeof this.y == "string" && this.y == "c")
    rect.y = h/2 - rect.h/2;
  else
    rect.y = this.y[0] + (this.y[1] * h);

  return rect;
};

// Allowed Types:
// (1) Number
// (2) Special Characters: {* : any}
// (3) 1st Order Equation of the other dimension
var SizeSet = function (w, h) {
  // Type 1
  this.w = w;
  this.h = h;
  // Type 2
  this.w_special = "*";
  this.h_special = "*";
  // Type 3
  this.wEqn = [];
  this.hEqn = [];

  function isEqn (x) {
    // Note: Doesn't check if the comma-sep vals are legit
    return (x.indexOf(",") != -1) || !isNaN(parseFloat(x));
  };

  function type (x) {
    if (typeof x == "number")
      return 1;
    if (typeof x == "string") {
      if (x == "*")
        return 2;
      if (isEqn(x))
        return 3;
    }
    return 4;
  };

  this.wType = type(w);
  this.hType = type(h);

  // Parsing 1st order equation string
  function parse (x) {
    var terms_s = x.split(",");
    var terms = [];
    for (var i = 0; i < terms.length; i++)
      terms[i] = parseFloat(terms_s[i]);
    return terms;
  };

  if (this.wType == 3)
    this.wEqn = parse(w);
  if (this.hType == 3)
    this.hEqn = parse(h);
};

var Context = function (sizeSet, isScrollable)
{
  this.sizeSet = sizeSet;
  this.el = $('<div>');
  if (this.sizeSet.wType == 1) this.el.width(this.sizeSet.w);
  if (this.sizeSet.hType == 1) this.el.height(this.sizeSet.h);

  // Subcontexts' defintions
  this.subcontexts = [];
  this.subareas = [];

  // Other Context Attributes
  this.overflow = "hidden";
  if (typeof isScrollable == "boolean" && isScrollable) {
    this.overflow = "scroll";
    console.log("scroller!");
  }

  this.el.css("overflow", this.overflow);
};
// Adds subcontext and places 
Context.prototype.add = function (context, area)
{
  this.el.append(context.el);
  var i = this.subcontexts.length;
  this.subcontexts[i] = context;
  this.subareas[i] = area;

  if (!area) {
    // TODO: Check that this context can be a block.
    context.el.css('position', 'static');
    context.el.css('display', 'inline-block');
    context.layout();
  } else {
    var subrect = area.map(this.el.width(), this.el.height());
    context.layout(subrect);
  }
};
Context.prototype.toggleClass = function (name) {
  this.el.toggleClass(name);
};
Context.prototype.layout = function (rect)
{
  this.el.css('margin', '0px');
  this.el.css('padding', '0px');
  if (rect) {
    this.el.css('position', 'absolute');
    this.el.css("left", rect.x+"px");
    this.el.css("top", rect.y+"px");
    this.el.width(rect.w);
    this.el.height(rect.h);
  } else {
    this.el.css('position', 'static');
    this.el.css('display', 'inline-block');
    // TODO: This is done on construction, but should generalize the case of one dimension maybe not being static
    this.el.width(this.sizeSet.w);
    this.el.height(this.sizeSet.h);
  }

  for (var i = 0; i < this.subcontexts.length; i++) {
    var context = this.subcontexts[i];
    var area = this.subareas[i];
    if (area) {
      var subrect = area.map(this.el.width(), this.el.height());
      context.layout(subrect);
    } else {
      context.layout();
    }
  }
};
