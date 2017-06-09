// small polyfill
if (!Array.prototype.contains) {
    Array.prototype.contains = function(s) {
        return this.indexOf(s) > -1
    }
}
document.addEventListener('DOMContentLoaded', init, false);

let sheets = [],
    maxDepth = 10; // maxim depth of the recursive calls

function Sheet(table, columns, numberOfRows) {
  this.id = createId();
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
    tr.getElementsByClassName(cell)[0].addEventListener('blur', this.blurChange.bind(this));
    tr.getElementsByClassName(cell)[0].addEventListener('focus', this.focusCell.bind(this));
    // creating new cell - not sure how to pass sheet data(should it be id or..?);
    this.cells[cell] = new Cell(cell, this.id);
  });
  return tr;
}
// event listeners for "focus/blur"
Sheet.prototype.focusCell = function(e) {
  let cell = e.target.className;
  this.cells[cell].changeValue(false);
}
Sheet.prototype.blurChange = function(e) {
  let newValue = e.target.value;
  let cell = e.target.className;
  this.cells[cell].calc(newValue);
}
// sheet initialize operation: creating rows and columns with event listeners
Sheet.prototype.initialize = function() {
  // creating header for default elements
  let tr = document.createElement('tr');
  tr.innerHTML = '<td></td>' + this.columns.map((col)=>'<td>' + col + '</td>').join('');
  this.table.append(tr);
  // creating default rows
  for (let i = 1; i < this.rows; ++i) {
    let newRow = this.createRow(i);
    this.table.appendChild(newRow);
  }
}
// calculating cell's value
Sheet.prototype.value = function(column, row) {
  let cell = this.cells[column + '-' + row];
  if (cell){
    return cell.value || 0;
  } else {
    return 0;
  }
}


function Cell(className, sheetId) {
  this.id = className;
  this.sheetId = sheetId;
  this.value = '';
  this.formula = '';
  this.error = '';
  this.precedents = []; // от чего зависит
  this.dependents = []; // что зависит
}
// regex check for c(row, col) formulas
Cell.prototype.regexValue = /c\([0-9]*,[0-9]*\)/g;
// changing visual representation of cell
Cell.prototype.changeValue = function(notSelected) {
  document.getElementsByClassName(this.id)[0].value = notSelected ? this.value : this.formula;
}

// calucating cells' formulas(links) and broadcasting event if cell has any dependents/precedents
Cell.prototype.calc = function(newValue, depth = 1, broadcasting) {
  if(depth < maxDepth){
    this.formula = newValue || newValue === '0' ? newValue : this.formula;
    // checking if there're any formulas and calculating their values
    let trimValue = this.formula.replace(/\s/g,'');
    let valuesFormulas = trimValue.match(this.regexValue);
    let sheet = sheets.find((sheet)=>sheet.id === this.sheetId);
    if (valuesFormulas) {
        trimValue = this.calcLink(sheet, trimValue, valuesFormulas, depth, broadcasting);
    }
    this.value = this.errorCheck(trimValue).error || eval(trimValue) || '';
    // recalculating dependent cells values
    if (depth === 1) {
      try {
          this.checkDependents(depth);
      } catch (e) {;
          if (depth === 1) this.errorHandling(e);
          // throw for recursion - otherwise we will have 0(zero) value
          throw e;
      }
    }
  } else {
    throw 'ERROR: probably there\'s recursion';
  }
  this.changeValue(true);
}

// calculation of the link value
Cell.prototype.calcLink = function(sheet, trimValue, valuesFormulas, depth, broadcasting) {
  // calculating our values;
  let precedents = valuesFormulas.map((formula)=>formula.match(/\d+/g).map((n)=>parseInt(n)));

  // checking dependencies - we gonna recalculate them a bit later
  if (!broadcasting) this.checkPrecedents(precedents, depth);
  // calculating data
  let calculatedValues = precedents.map(([col, row])=>sheet.value(col, row));
  // getting getting needed values
  let newValue = trimValue;
  // replacing formulas with values
  calculatedValues.forEach((calculated, i)=>{
    newValue = newValue.replace(`${valuesFormulas[i]}`, calculated);
  })
  return newValue;
}

// broadcasting cell change event to dependent cells for their recalculation
Cell.prototype.checkDependents = function(depth) {
  let newArr = this.dependents.map((el)=>el);
  let sheetCells = sheets.find((sheet)=>sheet.id === this.sheetId).cells,
      sheetName = Object.keys(sheetCells);
  // updating value
  if (depth !== 1) {
    this.calc(null, depth, true);
  }
  sheetName.forEach((el)=>{
    let cell = sheetCells[el];
    // broadcasting event
    if (this.dependents.contains(cell.id)) {
        cell.checkDependents(depth + 1);
    }
  })

}
// broadcasting cell change event to precedent cells for recalculation
Cell.prototype.checkPrecedents = function(precedents, depth) {
  let newArr = precedents.map((cel)=>cel.join('-'));
  // deleting unneeded dependents for precedent cells
  let deletePred = this.precedents.filter((el)=>!newArr.contains(el));
  let sheetCells = sheets.find((sheet)=>sheet.id === this.sheetId).cells,
      cellsNames = Object.keys(sheetCells);
  cellsNames.forEach((el)=>{
    let cell = sheetCells[el];
    if (deletePred.contains(cell.id))
      cell.changeDependents(this.id);
  });
  // adding new dependents
  let newPred = newArr.filter((el)=>!this.precedents.contains(el));
  cellsNames.forEach((el)=>{
    let cell = sheetCells[el];
    if (newPred.contains(cell.id))
      cell.changeDependents(this.id, true);
  });
  // saving new precedents
  this.precedents = newArr;
  // recalculating precendents
  cellsNames.forEach((el)=>{
    let cell = sheetCells[el];
    if (newPred.contains(cell.id)) {
        try {
            cell.calc(null, depth + 1);
        } catch (e) {;
            if (depth === 1) this.errorHandling(e);
            // throw for recursion - otherwise we will have 0(zero) value
            throw e;
        }
    }
  })
}
// for dependents change; add ? add new : delete old
Cell.prototype.changePrecedents = function(className, add=false) {
  if (add) this.precedents.push(className);
  else this.precedents.filter((dep, i, arr)=>arr.contains(className));
}
Cell.prototype.changeDependents = function(className, add=false) {
  if (add) {
    this.dependents.push(className);
  } else {
    this.dependents = this.dependents.filter((dep)=>dep !== classNames);
  }
}

// checking for errors - in our case we check for non-digit values
Cell.prototype.errorCheck = function(calculatedValue) {
  let letterIndex = calculatedValue.search(/[^0-9.+-\/*]/g);
  return letterIndex === -1 ? false : {error: `NaN: Check char at index "${letterIndex}"`};
}
// error handling
Cell.prototype.errorHandling = function(error) {
    this.value = error;
    this.changeValue(true);
}

function init() {
  let table = document.getElementById('table'),
    columns = ['1', '2', '3', '4', '5', '6'],
    rows = 5; // number of rows
  // creating new sheet
  sheets.push(new Sheet(table, columns, rows));
}

function createId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
