// zoofinder.js

// Wrapper for DOM buttons representing animals
function AnimalButtonWrapper(element) {
  this.el = element;
}

AnimalButtonWrapper.prototype.setAnimal = function(animal) {
  if (!animal) {
    this.el.textContent = '';
    this.el.classList.remove('has-animal');
    return;
  }
  this.el.textContent = animal.name; // Replace with icon/image if needed
  this.el.classList.add('has-animal');
};

// ZooFinder constructor
function ZooFinder(grid) {
  this.grid = grid;
  this.animalButtons = [];
  this.animals = [];
  this.biome = null;

  // populate buttons from DOM
  var buttonElements = document.querySelectorAll('.animal-button');
  for (var i = 0; i < buttonElements.length; i++) {
    this.animalButtons.push(new AnimalButtonWrapper(buttonElements[i]));
  }
}

// Private helper to collect all animal positions
ZooFinder.prototype._allPossibleArrangements = function() {
  var knownAnimalTiles = {};
  var emptyTiles = [];

  this.grid.each(function(cell, col, row) {
    if (cell.animal) {
      if (!knownAnimalTiles[cell.animal.identifier]) {
        knownAnimalTiles[cell.animal.identifier] = [];
      }
      knownAnimalTiles[cell.animal.identifier].push([col, row]);
    } else {
      emptyTiles.push([col, row]);
    }
  });

  return { knownAnimalTiles: knownAnimalTiles, emptyTiles: emptyTiles };
};

// Public method to display probabilities (stub, can expand)
ZooFinder.prototype.displayProbabilities = function() {
  var arrangements = this._allPossibleArrangements();
  console.log('Probabilities placeholder:', arrangements);
};

// Set the biome and populate animal buttons
ZooFinder.prototype.setBiome = function(biome) {
  var self = this;

  this.reset();
  this.biome = biome;
  this.grid.setBiome(biome);

  // Get animals in biome
  this.animals = Animal.inBiome(biome) || [];

  // Always add disco bux to every biome
  if (Animal.all['discobux']) {
    this.animals.push(Animal.all['discobux']);
  }

  // Assign animals to buttons safely
  _.each(this.animalButtons, function(button, index) {
    var animal = self.animals[index] || null;
    button.setAnimal(animal);
  });
};

// Reset grid and buttons
ZooFinder.prototype.reset = function() {
  var self = this;
  this.grid.each(function(cell) {
    cell.setSelected(false);
    cell.setAnimal(null);
  });

  // Clear all buttons
  _.each(this.animalButtons, function(button) {
    button.setAnimal(null);
  });
};

// Placeholder for arranging animals
ZooFinder.prototype.arrangeAnimals = function() {
  console.log('Arrange animals placeholder');
};

// Add additional methods here as needed
