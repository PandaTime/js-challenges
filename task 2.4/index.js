document.addEventListener('DOMContentLoaded', init, false);

let turnNumber = 0;
let fauna = [];
let context;

// index for better visability; initial size
let sizeIndex = 5;
let width = 100;
let height = 100;

// Basic constructor for all life beings
function Shape(x, y, fillStyle) {
    this.x = x;
    this.y = y;
    this.fillStyle = fillStyle;
}
Shape.prototype.stroke = function(context) {
    context.save();
    context.beginPath();
    context.rect(this.x * sizeIndex, this.y * sizeIndex, sizeIndex, sizeIndex);
    context.fillStyle = this.fillStyle;
    context.fill();
    context.restore();
};

// Predator
function Predator(x, y) {
    const color = "#FF0000";
    Shape.call(this, x, y, color);
}
Predator.prototype = Object.create(Shape.prototype);
Predator.prototype.constructor = Predator;

// Non-predator
function Herbivore(x, y) {
    const color = "#0066ff";
    Shape.call(this, x, y, color);
}
Herbivore.prototype = Object.create(Shape.prototype);
Herbivore.prototype.constructor = Herbivore;

// Plants
function Plant(x, y) {
    const color = "#009900";
    Shape.call(this, x, y, color);
}
Plant.prototype = Object.create(Shape.prototype);
Plant.prototype.constructor = Plant;


// reseting values
function annihilatePopulation() {
    fauna = [];
}
// checking if point on map is already taken
function checkIfTaken(x, y) {
  return fauna.some((el)=>{
    return (el.x === x) && (el.y === y);
  });
}
//
function randomPlace() {
  let x = parseInt(Math.random() * width),
    y = parseInt(Math.random() * height);
  if (checkIfTaken(x, y)) {
    return randomPlace();
  } else {
    return [x, y];
  }
}
// create first population
function firstPopulation() {
    let plants = parseInt(document.getElementById('plants-number').value) || 0,
        herbivores = document.getElementById('herbivore-number').value || 0,
        predators = document.getElementById('predator-number').value || 0;
    let plantsChance = document.getElementById('plants-chance').value || 0,
        herbivoresChance = document.getElementById('herbivore-chance').value || 0;
    // creating plants;
    fauna.push(...new Array(plants).fill(false).map(()=>new Plant(...randomPlace
    // creating plants;
    fauna.push(...new Array(herbivores).fill(false).map(()=>new Herbivore(...randomPlace())));
    // creating plants;
    fauna.push(...new Array(predators).fill(false).map(()=>new Predator(...randomPlace())));
}

// creating default world
function defaultSetup() {
    // clearing canvas
    //context.clearRect(0,0,width,height);
    annihilatePopulation();
    firstPopulation();
}

function attachEvents() {
    document.getElementsByClassName('next-turn')[0].onclick = act;
    document.getElementsByClassName('reset-world')[0].onclick = resetWorld;
}
function act() {
    ++turnNumber;
    document.getElementsByClassName('turn-number')[0].innerHTML = turnNumber;
    // clearing canvas
    context.clearRect(0, 0, width * sizeIndex, height * sizeIndex);
    // drawing our elements
    fauna.forEach((el)=>{
        el.stroke(context);
    });
}
function resetWorld() {
      turnNumber = -1;
      // creating default population
      defaultSetup()
      act();
}

function init() {
    let canvas = document.getElementById("myCanvas");
    // setting size/width based on multiplicator
    canvas.width = width * sizeIndex;
    canvas.height = height * sizeIndex;
    // setting context
    context = document.getElementById("myCanvas").getContext("2d");
    // adding event listeners
    attachEvents();
    resetWorld();
}
