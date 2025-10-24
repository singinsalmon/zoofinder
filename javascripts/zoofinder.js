// zoofinder.js

function ZooFinder(grid) {
  this.grid = grid;
  this.animalButtons = [];   // DOM buttons for animal roster
  this.animals = [];         // current biome's animals
  this.biome = null;
}

// Private helper: get all tiles for current grid
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

// Public method: display probabilities (optional, keep for original code)
ZooFinder.prototype.displayProbabilities = function() {
  var arrangements = this._allPossibleArrangements();
  console.log(arrangements);
};

// Set biome and populate animal buttons
ZooFinder.prototype.setBiome = function(biome) {
  var self = this;

  this.reset();
  this.biome = biome;
  this.grid.setBiome(biome);

  this.animals = Animal.inBiome(biome) || [];

  // Always add disco bux if available
  if (Animal.all['discobux']) this.animals.push(Animal.all['discobux']);

  // Assign animals to buttons safely
  _.each(this.animalButtons, function(button, index) {
    if (index < self.animals.length) {
      button.setAnimal(self.animals[index]);
    } else {
      button.setAnimal(null);
    }
  });
};

// Reset the grid
ZooFinder.prototype.reset = function() {
  this.grid.each(function(cell) {
    cell.setSelected(false);
    cell.setAnimal(null);
  });
};

// Arrange animals (placeholder, add your own logic)
ZooFinder.prototype.arrangeAnimals = function() {
  // Optional: implement your automatic placement here
};
