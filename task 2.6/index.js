document.addEventListener('DOMContentLoaded', init, false);

function Sheet(table, columns, numberOfRows) {
  this.table = table;
  this.columns = columns;
  this.rows = numberOfRows;
  this.cells = {};
  this.initialize();
}
// function for creating rows;
Sheet.prototype.createRow = function(rowNumber) {
  // adding header
  let tr = document.createElement('tr');
  tr.innerHTML = '<td>' + rowNumber + '</td>' + this.columns.map(
    (col) => '<td><input class="' + col + "-" + rowNumber + '" type="text"></td>'
  ).join('');
  // adding event listeners to cells
  this.columns.forEach((col)=>{
    let cell = col + '-' + rowNumber;
    tr.getElementsByClassName(cell)[0].addEventListener('keyup', this.cellChange.bind(this));
    this.cells[cell] = new Cell(cell);
  });
  return tr;
}
// Cell change handler
Sheet.prototype.cellChange = function(e) {
  let newValue = e.target.value;
  let cell = e.target.className;
  if (this.cells[cell].formula !== newValue){
    this.cells[cell].calc(newValue);
  }
}
// sheet initialize operation: creating rows and columns with event listeners
Sheet.prototype.initialize = function() {
  // creating header for default elements
  let tr = document.createElement('tr');
  tr.innerHTML = '<td></td>' + this.columns.map((col)=>'<td>' + col + '</td>').join('');
  this.table.append(tr);
  // creating default rows
  for (let i = 0; i < this.rows; ++i) {
    let newRow = this.createRow(i);
    this.table.appendChild(newRow);
  }
}
Sheet.prototype.value = function(column, row) {
  let cell = this.cells[column + '-' + row];
  if (cell){
    return cell.value || 0;
  } else {
    return 0;
  }
}
// calculating cell's value

function Cell(className) {
  this.id = className;
  this.value = '';
  this.formula = '';
  this.precedents = [];
  this.dependents = [];
}
// regex check for formulas
Cell.prototype.regexValue = /c\([0-9]*,[0-9]*\)/g;
Cell.prototype.calc = function(newValue) {
  this.formula = newValue;
  // checking if there're any formulas
  // calculating value
  let trimValue = newValue.replace(/\s/g,'');
  let valuesFormulas = trimValue.match(this.regexValue);
  if (valuesFormulas) {
    
  }
}

function init() {
  let table = document.getElementById('table'),
    columns = ['1', '2', '3', '4', '5', '6'],
    rows = 5;
  // creating new sheet
  let sheet1 = new Sheet(table, columns, rows);
}
