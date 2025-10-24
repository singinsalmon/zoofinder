// zoofinder.js

function ZooFinder(grid) {
  this.grid = grid;
  this.animalButtons = []; // should be set from HTML
  this.animals = [];
  this.biome = null;
}

// Private helper: get current animal positions and empty tiles
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

// Display probabilities placeholder (implement your own logic)
ZooFinder.prototype.displayProbabilities = function() {
  var arrangements = this._allPossibleArrangements();
  console.log("Probabilities calculation placeholder", arrangements);
};

// Reset grid
ZooFinder.prototype.reset = function() {
  this.grid.each(function(cell) {
    cell.setSelected(false);
    cell.setAnimal(null);
  });
};

// Set biome and populate animal buttons safely
ZooFinder.prototype.setBiome = function(biome) {
  var self = this;
  this.reset();
  this.biome = biome;
  this.grid.setBiome(biome);

  this.animals = Animal.inBiome(biome).slice(); // copy array
  this.animals.push(Animal.all['discobux']);    // always include discobux

  // Populate animal buttons safely
  _.each(this.animalButtons, function(button, index) {
    if (self.animals[index]) {
      button.setAnimal ? button.setAnimal(self.animals[index]) : button.data('animal', self.animals[index]);
    } else {
      button.setAnimal ? button.setAnimal(null) : button.data('animal', null);
    }
  });
};

// Arrange animals placeholder (implement your own logic)
ZooFinder.prototype.arrangeAnimals = function() {
  var self = this;
  if (!this.animals || this.animals.length === 0) return;

  // Simple example: place each animal starting from top-left
  var row = 0, col = 0;
  _.each(this.animals, function(animal) {
    _.each(animal.tiles, function(tile) {
      var x = col + tile[0], y = row + tile[1];
      if (x < self.grid.columns && y < self.grid.rows) {
        var cell = self.grid.at(x, y);
        if (cell) {
          cell.setSelected(true);
          cell.setAnimal(animal);
        }
      }
    });
    col += 1;
    if (col >= self.grid.columns) {
      col = 0;
      row += 1;
    }
  });
};
