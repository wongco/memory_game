// data strucure of memory game
// each cell in row/col grid represents a card object that holds two properties
// card object data
//   matchValue:unique ID shared with another card
//   matchedStatus: boolean if matching partner has been discovered

// game process - once started
// display grid to DOM
// increase counter to track every click on a card that has matched: false
// show card and if variable findPair is true
//

document.addEventListener('DOMContentLoaded', function() {
  // Wait for DOM Load Content prior to executing;
  // use grid layout to store information
});

function createGameGrid(rows, cols) {
  try {
    // if rows * cols is not even number, throw error
    if ((rows * cols) % 2 === 1) {
      throw 'Total cards is an odd number!';
    }
    var gameGrid = [];
    var matchValues = createMatchValues(rows * cols);
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) {
        var randomResultIdx = Math.floor(Math.random() * matchValues.length);
        row.push({
          matchValue: matchValues.splice(randomResultIdx, 1)[0],
          matched: false
        });
      }
      gameGrid.push(row);
    }
    return gameGrid;
  } catch (error) {
    console.log(error, 'Rows * Columns need to be an even number');
  }
}

function createMatchValues(totalValues) {
  var result = [];
  for (var i = 0; i < totalValues / 2; i++) {
    result.push(i);
  }
  return result.concat(result);
}

function consoleDisplay(gameGrid) {
  gameGrid.forEach(function(row, rowIdx) {
    var rowDisplayStr = '';
    for (var col = 0; col < row.length; col++) {
      var card = gameGrid[rowIdx][col];
      rowDisplayStr += `[ ${card.matchValue},${card.matched} ] `;
    }
    console.log(rowDisplayStr);
  });
}

function areCardsMatching(card1, card2) {
  return card1.matchValue === card2.matchValue;
}

var gameGrid = createGameGrid(4, 5);
consoleDisplay(gameGrid);
