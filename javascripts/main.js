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
      _.sortBy(Animal.ordered, 'name'), // sort by n_
