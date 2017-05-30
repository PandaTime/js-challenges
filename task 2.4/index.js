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
    context.rect(this.x, this.y, sizeIndex, sizeIndex);
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
function randomPlace(number) {
    
}
// create first population
function firstPopulation() {
    // temp
    fauna.push(new Plant(10, 10));
    fauna.push(new Herbivore(20, 20));
    fauna.push(new Predator(30, 30));
    let plants = document.getElementById('plants-number').value,
        herbivores = document.getElementById('herbivore-number').value,
        predators = document.getElementById('predator-number').value;
    let plantsChance = document.getElementById('plants-chance').value,
        herbivoresChance = document.getElementById('herbivore-chance').value;
    fauna.push(...new Array(plants).fill(new Plant()));
}

// creating default world
function defaultSetup() {
    annihilatePopulation();
    firstPopulation();
}

function attachEvents() {
    document.getElementsByClassName('next-turn')[0].onclick = act;
    document.getElementsByClassName('reset-world')[0].onclick = resetWorld;
}
function act() {
    ++turnNumber;
    fauna.forEach((el)=>{
        el.stroke(context);
    });
    document.getElementsByClassName('turn-number')[0].innerHTML = turnNumber;
}
function resetWorld() {
      turnNumber = -1;
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
    // creating default population
    defaultSetup()
}
