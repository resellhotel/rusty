Template.visitors.visitors = function () {
  return Visitors.find({});
}
Template.visitor.string = function () {
  return JSON.stringify(this);
}