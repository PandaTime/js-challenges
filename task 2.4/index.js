document.addEventListener('DOMContentLoaded', render, false);

var turnNumber = 0;
var plants = [], herbivores = [], predators = [];

// Basic constructor for all life beings
function Shape(x, y, strokeStyle) {
  this.x = x;
  this.y = y;
  this.strokeStyle = strokeStyle;
}
Shape.prototype.createPath = function(context) {
      context.fillRect(this.x, this.y, this.x, this.y);
};
Shape.prototype.stroke = function(context) {
    context.save();
    context.strokeStyle = this.strokeStyle;
    this.createPath(context);
		context.stroke();
		context.restore();
};

// Predator
function Predator(x, y) {
  const color = "#FF0000";
  Shape.call(thix, x, y, color);
}
Predator.prototype = Object.create(Shape.prototype);
Predator.prototype.constructor = Predator;

// Non-predator
function Herbivore(x, y) {
  const color = "#FF0000";
  Shape.call(thix, x, y, color);
}
Herbivore.prototype = Object.create(Shape.prototype);
Herbivore.prototype.constructor = Herbivore;

// Plants
function Plant(x, y) {
  const color = "#FF0000";
  Shape.call(thix, x, y, color);
}
Plant.prototype = Object.create(Shape.prototype);
Plant.prototype.constructor = Plant;

//
function draw() {

}

function attachEvents() {
  document.getElementsByClassName('next-turn')[0].onclick = act;
    document.getElementsByClassName('reset-world')[0].onclick = resetWorld;
}
function act() {
  ++turnNumber;
  document.getElementsByClassName('turn-number')[0].innerHTML = turnNumber;
}
function resetWorld() {
  turnNumber = -1;
  act();
}
function render() {
  attachEvents();
}
