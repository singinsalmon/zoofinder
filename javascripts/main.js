var grid, zoofinder;

// ----- Helper Functions -----

// Get the current selected shape in the grid
var shapeInGrid = function() {
  var minRow = grid.rows,
      maxRow = 0,
      minCol = grid.columns,
      maxCol = 0;

  var gridValues = _.map(grid.cellRows, function(row, rowIndex) {
    return _.map(row, function(cell, colIndex) {
      if (cell.selected) {
        minRow = Math.min(rowIndex, minRow);
        maxRow = Math.max(rowIndex, maxRow);
        minCol = Math.min(colIndex, minCol);
        maxCol = Math.max(colIndex, maxCol);
        return 1;
      }
      return 0;
    });
  });

  // Reject empty rows outside selected area
  gridValues = _.reject(gridValues, function(row, rowIndex) {
    return rowIndex < minRow || rowIndex > maxRow;
  });

  // Slice columns outside selected area
  gridValues = _.map(gridValues, function(row) {
    return row.slice(minCol, maxCol + 1);
  });

  return gridValues;
};

// Format a matrix to a string (for debug output)
var formatMatrix = function(matrix, trueFormat, falseFormat) {
  trueFormat = _.isUndefined(trueFormat) ? 'X' : trueFormat;
  falseFormat = _.isUndefined(falseFormat) ? '.' : falseFormat;
  return _.map(matrix, function(row) {
    return _.map(row, function(value) {
      return value ? trueFormat : falseFormat;
    }).join('');
  }).join('\n');
};

// ----- Main Initialization -----
$(function() {
  FastClick.attach(document.body);

  if ('ontouchstart' in document) {
    $('body').removeClass('no-touch');
  }

  // ----- Initialize grid and Zoofinder -----
  grid = new ZooGrid('#zoo');
  zoofinder = new ZooFinder(grid);

  // ----- Buttons -----
  $('#arrange-button').click(function() { zoofinder.arrangeAnimals(); });
  $('#reset-button').click(function() { zoofinder.reset(); });
  $('#probability-button').click(function() { zoofinder.displayProbabilities(); });

  // ----- Animal Dropdown -----
  var animalList = $('#animal-list');
  animalList.append('<option value="">Choose an animal...</option>');

  var rarityOrder = ['common', 'rare', 'mythical', 'timeless', 'pet', 'bux'];

  // Sort animals: name → rarity → biome
  var sortedAnimals = _.sortBy(
    _.sortBy(
      _.sortBy(Animal.ordered, 'name'), // sort by name first
      function(a) { 
        var idx = rarityOrder.indexOf(a.rarity);
        return idx !== -1 ? idx : 999;  // unknown rarities last
      }
    ),
    function(a) { 
      return a.biome ? a.biome.name : 'zzz';  // null biome last
    }
  );

  // Group animals by biome for dropdown
  var currentBiomeName = null;
  var currentGroup = null;

  _.each(sortedAnimals, function(animal) {
    var biomeName = animal.biome ? animal.biome.name : 'Other';

    if (biomeName !== currentBiomeName) {
      if (currentGroup) animalList.append(currentGroup);
      currentGroup = $('<optgroup label="' + biomeName + '">');
      currentBiomeName = biomeName;
    }

    currentGroup.append('<option value="' + animal.identifier + '">' + animal.name + '</option>');
  });

  if (currentGroup) animalList.append(currentGroup);

  // ----- Animal Selection Handler -----
  animalList.change(function() {
    var value = $(this).val();
    grid.reset();

    if (!value) return;

    var animal = Animal.all[value];

    // Safely set biome
    if (animal.biome) {
      zoofinder.setBiome(animal.biome);
    }

    // Place animal tiles safely
    _.each(animal.tiles, function(tile) {
      var x = tile[0], y = tile[1];

      if (x >= 0 && x < grid.columns && y >= 0 && y < grid.rows) {
        var cell = grid.at(x, y);
        if (cell) {
          cell.setSelected(true);
          cell.setAnimal(animal);
        }
      }
    });
  });

  // ----- Biome Dropdown -----
  _.each(Biome.ordered, function(biome) {
    $('#biome-list').append('<option value="' + biome.identifier + '">' + biome.name + '</option>');
  });

  $('#biome-list').change(function() {
    var biome = Biome.all[$(this).val()];
    if (biome) zoofinder.setBiome(biome);
  });

  $('#biome-list').trigger('change');

  if (!grid.biome) {
    zoofinder.setBiome(Biome.all['farm']);
  }

  // ----- Debug: Generate animal code -----
  $('#generate-output').click(function() {
    var animalName = prompt('Animal name');
    var output = 'new Animal(\'' + animalName + '\', undefined, undefined, ' + JSON.stringify(Animal.fromShape(animalName, shapeInGrid()).tiles) + ')' + '\n';
    $('textarea#debug-output').text(output).focus().select();
  });
});
