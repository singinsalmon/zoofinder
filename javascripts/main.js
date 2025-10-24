var grid, zoofinder;

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

  // reject empty rows
  gridValues = _.reject(gridValues, function(row, rowIndex) {
    return rowIndex < minRow || rowIndex > maxRow;
  });

  // slice empty columns
  gridValues = _.map(gridValues, function(row) {
    return row.slice(minCol, maxCol + 1);
  });

  return gridValues;
};

var formatMatrix = function(matrix, trueFormat, falseFormat) {
  trueFormat = _.isUndefined(trueFormat) ? 'X' : trueFormat;
  falseFormat = _.isUndefined(falseFormat) ? '.' : falseFormat;
  return _.map(matrix, function(row) {
    return _.map(row, function(value) {
      return value ? trueFormat : falseFormat;
    }).join('');
  }).join('\n');
};

$(function() {
  FastClick.attach(document.body);
  if ('ontouchstart' in document) {
    $('body').removeClass('no-touch');
  }

  // initialize grid and zoofinder
  grid = new ZooGrid('#zoo');
  zoofinder = new ZooFinder(grid);

  // ---------- Animal List Dropdown ----------
  var animalList = $('#animal-list');
  animalList.append('<option value="">Choose an animal...</option>');

  // Sort animals by biome, then rarity, then name
  var rarityOrder = ['common','rare','mythical','timeless','pet','bux'];
  var sortedAnimals = _.sortBy(Animal.ordered, function(a) {
    var biomeName = a.biome ? a.biome.name : 'zzz';
    var rarityIndex = rarityOrder.indexOf(a.rarity);
    if (rarityIndex === -1) rarityIndex = 999;
    return [biomeName, rarityIndex, a.name];
  });

  // Group by biome
  var currentGroup = null;
  var currentBiome = null;
  _.each(sortedAnimals, function(a) {
    var biomeName = a.biome ? a.biome.name : 'Other';
    if (biomeName !== currentBiome) {
      if (currentGroup) animalList.append(currentGroup);
      currentGroup = $('<optgroup label="'+biomeName+'">');
      currentBiome = biomeName;
    }
    currentGroup.append('<option value="'+a.identifier+'">'+a.name+'</option>');
  });
  if (currentGroup) animalList.append(currentGroup);

  // Handle animal selection
  animalList.change(function() {
    var val = $(this).val();
    grid.reset();
    if (!val) return;

    var animal = Animal.all[val];
    if (animal.biome) zoofinder.setBiome(animal.biome);

    _.each(animal.tiles, function(tile) {
      var x = tile[0], y = tile[1];
      if (x >=0 && x < grid.columns && y >=0 && y < grid.rows) {
        var cell = grid.at(x,y);
        if (cell) {
          cell.setSelected(true);
          cell.setAnimal(animal);
        }
      }
    });
  });

  // ---------- Biome Dropdown ----------
  _.each(Biome.ordered, function(b) {
    $('#biome-list').append('<option value="'+b.identifier+'">'+b.name+'</option>');
  });
  $('#biome-list').change(function() {
    zoofinder.setBiome(Biome.all[$(this).val()]);
  });
  $('#biome-list').trigger('change');

  if (!grid.biome) zoofinder.setBiome(Biome.all['farm']);

  // ---------- Grid Buttons ----------
  $('#arrange-button').click(function(){ zoofinder.arrangeAnimals(); });
  $('#reset-button').click(function(){ zoofinder.reset(); });
  $('#probability-button').click(function(){ zoofinder.displayProbabilities(); });

  // ---------- Animal Generator ----------
  $('#generate-output').click(function() {
    var animalName = prompt('Animal name');
    var tiles = Animal.fromShape(animalName, shapeInGrid()).tiles;
    var output = "new Animal('"+animalName+"', undefined, undefined, "+JSON.stringify(tiles)+")\n";
    $('textarea#debug-output').text(output).focus().select();
  });
});
