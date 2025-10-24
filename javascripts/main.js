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

  // ---------- Animal list setup ----------
var animalList = $('#animal-list')
animalList.append('<option value="">Choose an animal...</option>')

// Define rarity order
var rarityOrder = ['common', 'rare', 'mythical', 'timeless', 'pet', 'bux']

// Sort animals by biome (alphabetical), then rarity, then name
var sortedAnimals = _.orderBy(
  Animal.ordered,
  [
    function(animal) { return animal.biome ? animal.biome.name : 'zzz' },   // biome (null last)
    function(animal) { 
      var index = rarityOrder.indexOf(animal.rarity)
      return index !== -1 ? index : 999
    },                                                                       // rarity
    'name'                                                                     // name
  ],
  ['asc', 'asc', 'asc']
)

// Group by biome and append to dropdown
var currentBiomeName = null
var currentGroup = null

_.each(sortedAnimals, function(animal) {
  var biomeName = animal.biome ? animal.biome.name : 'Other'

  // start new optgroup if biome changes
  if (biomeName !== currentBiomeName) {
    if (currentGroup) animalList.append(currentGroup)
    currentGroup = $('<optgroup label="' + biomeName + '">')
    currentBiomeName = biomeName
  }

  currentGroup.append('<option value="' + animal.identifier + '">' + animal.name + '</option>')
})

// append the last group
if (currentGroup) animalList.append(currentGroup)


// ---------- Animal selection handler ----------
animalList.change(function() {
  var value = $(this).val()
  grid.reset()

  if (!value) return

  var animal = Animal.all[value]
  zoofinder.setBiome(animal.biome)

  // Place tiles safely
  _.each(animal.tiles, function(tile) {
    var cell = grid.at(tile[0], tile[1])
    if (cell) {                   // <-- safe check
      cell.setSelected(true)
      cell.setAnimal(animal)
    }
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
