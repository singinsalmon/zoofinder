var grid, zoofinder;

$(function() {
  FastClick.attach(document.body);
  if ('ontouchstart' in document) $('body').removeClass('no-touch');

  // Initialize grid and zoo
  grid = new ZooGrid('#zoo');
  zoofinder = new ZooFinder(grid);

  // ---------- Link roster buttons ----------
  zoofinder.animalButtons = [];
  $('#roster-container .animal-button').each(function() {
    var $el = $(this);
    zoofinder.animalButtons.push({
      setAnimal: function(animal) {
        $el.data('animal', animal);
        if (animal) {
          $el.text(animal.name);
        } else {
          $el.text('');
        }
      }
    });
  });

  // ---------- Populate animal dropdown ----------
  var animalList = $('#animal-list');
  animalList.empty().append('<option value="">Choose an animal...</option>');

  var rarityOrder = ['common','rare','mythical','timeless','pet','bux'];

  var sortedAnimals = _.sortBy(Animal.ordered, function(a) {
    var biomeName = a.biome ? a.biome.name : 'zzz';
    var rarityIndex = rarityOrder.indexOf(a.rarity);
    if (rarityIndex === -1) rarityIndex = 999;
    return [biomeName, rarityIndex, a.name];
  });

  var currentGroup = null, currentBiome = null;
  _.each(sortedAnimals, function(a) {
    var biomeName = a.biome ? a.biome.name : 'Other';
    if (biomeName !== currentBiome) {
      if (currentGroup) animalList.append(currentGroup);
      currentGroup = $('<optgroup label="' + biomeName + '">');
      currentBiome = biomeName;
    }
    currentGroup.append('<option value="' + a.identifier + '">' + a.name + '</option>');
  });
  if (currentGroup) animalList.append(currentGroup);

  // ---------- Animal selection ----------
  animalList.change(function() {
    var value = $(this).val();
    grid.reset();
    if (!value) return;

    var animal = Animal.all[value];
    if (animal.biome) zoofinder.setBiome(animal.biome);

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

  // ---------- Biome selection ----------
  _.each(Biome.ordered, function(b) {
    $('#biome-list').append('<option value="' + b.identifier + '">' + b.name + '</option>');
  });
  $('#biome-list').change(function() {
    zoofinder.setBiome(Biome.all[$(this).val()]);
  }).trigger('change');

  if (!grid.biome) zoofinder.setBiome(Biome.all['farm']);

  // ---------- Buttons ----------
  $('#arrange-button').click(function() { zoofinder.arrangeAnimals(); });
  $('#reset-button').click(function() { zoofinder.reset(); });
  $('#probability-button').click(function() { zoofinder.displayProbabilities(); });

  // ---------- Generate animal debug ----------
  $('#generate-output').click(function() {
    var animalName = prompt('Animal name');
    var output = 'new Animal(\'' + animalName + '\', undefined, undefined, ' +
                 JSON.stringify(Animal.fromShape(animalName, shapeInGrid()).tiles) + ')\n';
    $('textarea#debug-output').text(output).focus().select();
  });

  // ---------- Shape helper ----------
  function shapeInGrid() {
    var minRow = grid.rows, maxRow = 0, minCol = grid.columns, maxCol = 0;
    var gridValues = _.map(grid.cellRows, function(row, r) {
      return _.map(row, function(cell, c) {
        if (cell.selected) { minRow = Math.min(r,minRow); maxRow=Math.max(r,maxRow); minCol=Math.min(c,minCol); maxCol=Math.max(c,maxCol); return 1; }
        return 0;
      });
    });

    gridValues = _.reject(gridValues, function(row,r){ return r<minRow || r>maxRow; });
    gridValues = _.map(gridValues, function(row){ return row.slice(minCol,maxCol+1); });
    return gridValues;
  }
});
