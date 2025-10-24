var grid, zoofinder;

var shapeInGrid = function() {
  var minRow = grid.rows,
      maxRow = 0,
      minCol = grid.columns,
      maxCol = 0

  var gridValues = _.map(grid.cellRows, function(row, rowIndex) {
    return _.map(row, function(cell, colIndex) {
      if (cell.selected) {
        minRow = Math.min(rowIndex, minRow)
        maxRow = Math.max(rowIndex, maxRow)
        minCol = Math.min(colIndex, minCol)
        maxCol = Math.max(colIndex, maxCol)
        return 1
      }
      return 0
    })
  })

  // reject rows that are out of bounds (empty)
  gridValues = _.reject(gridValues, function(row, rowIndex) {
    return rowIndex < minRow || rowIndex > maxRow
  })

  // slice away columns that are out of bounds (empty)
  gridValues = _.map(gridValues, function(row) {
    return row.slice(minCol, maxCol + 1)
  })

  return gridValues
}

var formatMatrix = function(matrix, trueFormat, falseFormat) {
  trueFormat = _.isUndefined(trueFormat) ? 'X' : trueFormat
  falseFormat = _.isUndefined(falseFormat) ? '.' : falseFormat
  return _.map(matrix, function(row) {
    return _.map(row, function(value) {
      return value ? trueFormat : falseFormat
    }).join('')
  }).join('\n')
}

$(function() {
  FastClick.attach(document.body)
  if ('ontouchstart' in document) {
    $('body').removeClass('no-touch');
  }

  $('#arrange-button').click(function() {
    zoofinder.arrangeAnimals()
  })

  $('#reset-button').click(function() {
    zoofinder.reset()
  })

  $('#probability-button').click(function() {
    zoofinder.displayProbabilities()
  })

  grid = new ZooGrid('#zoo')
  zoofinder = new ZooFinder(grid)

  // animal list
  var latestBiome
  var latestBiomeGroup
  var animalList = $('#animal-list')

  animalList.append('<option value="">Choose an animal...</option>')

  // Sort animals by rarity and then biome name
var rarityOrder = ['common', 'rare', 'mythical', 'timeless', 'pet', 'bux'];

var sortedAnimals = _.sortBy(Animal.ordered, function(animal) {
  var rarityIndex = rarityOrder.indexOf(animal.rarity);
  if (rarityIndex === -1) rarityIndex = 999; // unknown rarities at the end
  var biomeName = animal.biome ? animal.biome.name : ''; // handle null biome
  return [biomeName, rarityIndex, animal.name];
});

_.each(sortedAnimals, function(animal) {

    if (animal.biome != latestBiome) {
      if (latestBiomeGroup)
        animalList.append(latestBiomeGroup)

      latestBiomeGroup = $('<optgroup label="' + animal.biome.name + '">')
      latestBiome = animal.biome
    }

    var parent = latestBiomeGroup ? latestBiomeGroup : animalList
    parent.append('<option value="' + animal.identifier + '">' + animal.name + '</option>')
  })

  if (latestBiomeGroup)
    animalList.append(latestBiomeGroup)


  animalList.change(function() {
    var value = $(this).val()

    grid.reset()

    if (!value)
      return

    var animal = Animal.all[value]
    zoofinder.setBiome(animal.biome)

    _.each(animal.tiles, function(tile) {
      var cell = grid.at(tile[0], tile[1])
      cell.setSelected(true)
      cell.setAnimal(animal)
    })
  })

  // biome list
  _.each(Biome.ordered, function(biome) {
    $('#biome-list').append('<option value="' + biome.identifier + '">' + biome.name + '</option>')
  })

  $('#biome-list').change(function() {
    zoofinder.setBiome(Biome.all[$(this).val()])
  })

  $('#biome-list').trigger('change')

  if (!grid.biome)
    zoofinder.setBiome(Biome.all['farm'])

  // animal generation
  $('#generate-output').click(function() {
    var animalName = prompt('Animal name')
    var output = 'new Animal(\'' + animalName + '\', undefined, undefined, ' + JSON.stringify(Animal.fromShape(animalName, shapeInGrid()).tiles) + ')' + '\n'
    $('textarea#debug-output').text(output).focus().select()
  })
})
