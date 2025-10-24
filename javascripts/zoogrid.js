// zoogrid.js

function ZooGrid(selector, rows = 5, columns = 5) {
  this.rows = rows;
  this.columns = columns;
  this.selector = selector;
  this.cellRows = [];

  const container = document.querySelector(selector);
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${columns}, 60px)`;
  container.style.gridGap = '4px';

  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < columns; x++) {
      const cell = {
        selected: false,
        animal: null,
        element: document.createElement('div'),
        setSelected: function(v) {
          this.selected = v;
          this.updateDisplay();
        },
        setAnimal: function(a) {
          this.animal = a;
          this.updateDisplay();
        },
        updateDisplay: function() {
          if (this.animal) {
            this.element.textContent = this.animal.name[0]; // first letter of name
            this.element.style.backgroundColor = this.animal.color || '#aaa';
          } else {
            this.element.textContent = '';
            this.element.style.backgroundColor = this.selected ? '#ddd' : '#fff';
          }
        }
      };

      cell.element.style.width = '60px';
      cell.element.style.height = '60px';
      cell.element.style.border = '1px solid #333';
      cell.element.style.display = 'flex';
      cell.element.style.alignItems = 'center';
      cell.element.style.justifyContent = 'center';
      cell.element.style.fontWeight = 'bold';
      cell.element.style.cursor = 'pointer';

      // Optional: click to toggle selection
      cell.element.addEventListener('click', () => {
        cell.setSelected(!cell.selected);
      });

      container.appendChild(cell.element);
      row.push(cell);
    }
    this.cellRows.push(row);
  }
}

ZooGrid.prototype.each = function(callback) {
  for (let y = 0; y < this.rows; y++) {
    for (let x = 0; x < this.columns; x++) {
      callback(this.cellRows[y][x], x, y);
    }
  }
};

ZooGrid.prototype.at = function(x, y) {
  if (y >= 0 && y < this.rows && x >= 0 && x < this.columns) {
    return this.cellRows[y][x];
  }
  return null;
};

ZooGrid.prototype.setBiome = function(biome) {
  // optional: reset background colors, etc.
  this.each(cell => {
    cell.setSelected(false);
    cell.setAnimal(null);
  });
};
