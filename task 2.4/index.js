document.addEventListener('DOMContentLoaded', init, false);

let turnNumber = 0;
let population = {
    plants: 0,
    herbivores: 0,
    predators: 0
};
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
    this.energy = 0;
    this.id = createId();
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
    ++population.predators;
    Shape.call(this, x, y, color);
}
Predator.prototype = Object.create(Shape.prototype);
Predator.prototype.constructor = Predator;
Predator.prototype.type = 'predators';
Predator.prototype.oppositeType = 'herbivores';
Predator.prototype.action = function() {
    if (this.energy < 0.5) {
        this.energy += 0.2;
    } else {
        this.energy -= 0.5;
        let pos = getNextPosition(this.x, this.y, this.oppositeType);
        this.x = pos.x;
        this.y = pos.y;
        if (pos.energy)
            this.energy += pos.energy;
    }
}

// Non-predator
function Herbivore(x, y, energy = 0) {
    const color = "#0066ff";
    this.energy = energy;
    ++population.herbivores;
    Shape.call(this, x, y, color);
}
Herbivore.prototype = Object.create(Shape.prototype);
Herbivore.prototype.constructor = Herbivore;
Herbivore.prototype.breedEnergy = 10;
Herbivore.prototype.type = 'herbivores';
Herbivore.prototype.oppositeType = 'plants';
Herbivore.prototype.action = function() {
    if (this.energy < 0.5) {
        this.energy += 0.2;
    } else if(this.energy > this.breedEnergy ){
        this.breed();
    } else {
        this.energy -= 0.5;
        let pos = getNextPosition(this.x, this.y, this.oppositeType);
        this.x = pos.x;
        this.y = pos.y;
        if (pos.energy)
            this.energy += pos.energy;
    }
};
Herbivore.prototype.breed = function() {
    this.energy = this.energy / 2;
    let newHerbivore = new Herbivore(...randomPlace(), this.energy);
    fauna.push(newHerbivore);
};
// Plants
function Plant(x, y, energyChance, energy = 0) {
    const color = "#009900";
    this.energyChance = energyChance;
    this.energy = energy;
    ++population.plants;
    Shape.call(this, x, y, color);
}
Plant.prototype = Object.create(Shape.prototype);
Plant.prototype.constructor = Plant;
Plant.prototype.breedEnergy = 5;
Plant.prototype.type = 'plants';
Plant.prototype.action = function() {
    // checking if we should breed;
    if (Math.random() < this.energyChance){
        this.energy += 1;
        if (this.energy > this.breedEnergy) {
            this.breed();
        }
    }
};
Plant.prototype.breed = function() {
    this.energy = this.energy / 2;
    let newPlant = new Plant(...randomPlace(), this.energyChance, this.energy);
    fauna.push(newPlant);
};

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
// function to check surrounding
function getNextPosition(x, y, oppositeType) {
    let possibleFood = fauna.filter((el)=>{
        return (el.type===oppositeType) && (el.x > x - 2) && (el.x < x + 2) && (el.y > y - 2) && (el.y < y + 2);
    });
    // plants; others
    if (!oppositeType) {
        return randomPlace();
    } else if(!possibleFood[0]) {
        return {x: x + parseInt(Math.random() * 3) - 1,  y: y + parseInt(Math.random() * 3) - 1};
    } else {
        let food = possibleFood.reduce(function(prev, current) {
            return (prev.energy > current.energy) ? prev : current
        });
        --population[oppositeType];
        fauna.splice(fauna.findIndex((el)=>el.id === food.id), 1);
        return food;
    }
}
// create first population
function firstPopulation() {
    let plants = parseInt(document.getElementById('plants-number').value) || 0,
        herbivores = parseInt(document.getElementById('herbivore-number').value) || 0,
        predators = parseInt(document.getElementById('predator-number').value) || 0;
    let plantsChance = parseFloat(document.getElementById('plants-chance').value) || 0;
    // reseting values
    population.plants = 0;
    population.herbivores = 0;
    population.predators = 0;
    // creating plants;
    fauna.push(...new Array(plants).fill(false).map(()=>new Plant(...randomPlace(), plantsChance)));
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
    document.getElementsByClassName('next-ten-turns')[0].onclick = acts.bind(this, 10);
    document.getElementsByClassName('next-hundred-turns')[0].onclick = acts.bind(this, 100);
    document.getElementsByClassName('reset-world')[0].onclick = resetWorld;
}
function acts(number) {
    for (let i=0;i<number;++i) {
        setTimeout(function(){ act(); }, i * 500);
    }
}
function act() {
    // clearing canvas
    context.clearRect(0, 0, width * sizeIndex, height * sizeIndex);
    // changing state
    // drawing our elements
    fauna.forEach((el)=>{
        el.action();
    });
    // we have updated fauna.
    // Yeap, that's not the beset idea - doulbe "for" loop, but..)
    fauna.forEach((el)=>{
        el.stroke(context);
    });
    ++turnNumber;
    document.getElementsByClassName('turn-number')[0].innerHTML = turnNumber;
    document.getElementsByClassName('plants-number')[0].innerHTML = population.plants;
    document.getElementsByClassName('herbivore-number')[0].innerHTML = population.herbivores;
    document.getElementsByClassName('predators-number')[0].innerHTML = population.predators;
}
function resetWorld() {
      turnNumber = -1;
      // creating default population
      defaultSetup();
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
    //resetWorld();
}

function createId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}