// Data Structure of Game
// each cell in row/col grid represents a card object that holds two properties
// card object data
//   matchValue:unique ID shared with another card
//   matchedStatus: boolean if matching partner has been discovered

// Intro Screen
// start game, view high scores = top5 only.
//   order by least amount of clicks

// New Game Setup
// game process - once started
// display grid to DOM

// Turn Based Listener
// utilize listener for any card click
// if selected card matchstatus is true, ignore click
// else
//   reveal card
//   increase totalCardCheckCount;
//   add card to checking cardmatch queue
//   if card match queue lengh is 2, compare
//     if matching, empty queue, add 2 to count of totalmatched cards.
//     else flip both card back over
// check for victory condition
//   if totalmatched cards === totalCards
//     game is over
//     kill eventlistener
//     save score to LocalStorage

document.addEventListener('DOMContentLoaded', function() {
  var gameContainer = document.getElementById('game');
  gameContainer.addEventListener('click', function(event) {
    console.log(event);
    // find element being targeted
    // send command to game.activateTurn(id);
  });
});

var game = {
  gameGrid: [],
  matchQueue: [],
  rows: 4,
  cols: 5,
  totalClickCount: 0,
  totalFound: 0,
  // Generate Grid for Game
  createGameGrid: function(rows, cols) {
    try {
      // if rows * cols is not even number, throw error
      if ((rows * cols) % 2 === 1) {
        throw 'Total cards is an odd number!';
      }
      this.rows = rows;
      this.cols = cols;
      var matchValues = this.createMatchValues(this.rows * this.cols);
      var id = 0;
      for (var i = 0; i < this.rows * this.cols; i++) {
        var randomResultIdx = Math.floor(Math.random() * matchValues.length);
        this.gameGrid.push({
          id: id,
          matchValue: matchValues.splice(randomResultIdx, 1)[0],
          matchedStatus: false,
          isFlipped: false
        });
        id++;
      }
    } catch (error) {
      console.log(error, 'Rows * Columns need to be an even number');
    }
  },
  // Create Reference Values for Game
  createMatchValues: function(totalValues) {
    var result = [];
    for (var i = 0; i < totalValues / 2; i++) {
      result.push(i);
    }
    return result.concat(result);
  },
  // Debug Display for Console
  displayToConsole: function() {
    var count = 0;
    for (var i = 0; i < this.rows; i++) {
      var rowDisplayStr = '';
      for (var j = 0; j < this.cols; j++) {
        var card = this.gameGrid[count];
        rowDisplayStr += ` [id:${card.id},${card.matchValue},${
          card.matchedStatus
        },`;
        rowDisplayStr += card.isFlipped === true ? `ON] ` : `OFF] `;
        count++;
      }
      console.log(rowDisplayStr);
    }
    console.log(`Total click count: ${this.totalClickCount}`);
    console.log(`Total found count: ${this.totalFound}`);
  },
  areCardsMatching: function(cardId1, cardId2) {
    return (
      this.gameGrid[cardId1].matchValue === this.gameGrid[cardId2].matchValue
    );
  },
  activateTurn: function(id) {
    // check that matchedStatus is false and that item is not currently in matchQueue
    if (
      this.gameGrid[id].matchedStatus === false &&
      this.matchQueue.indexOf(id) === -1
    ) {
      this.totalClickCount++; // increase total click count
      this.flipCard(id); // flip the card
      this.matchQueue.push(id); // push item into matching Queue
      // check if queue is full
      if (this.matchQueue.length === 2) {
        // matching Queue has 2 items. Process.
        this.processQueue();
      }
    }

    if (this.totalFound === this.rows * this.cols) {
      console.log('Game Over: All pairs found!');
    }
    game.displayToConsole();
  },
  flipCard: function(id) {
    this.gameGrid[id].isFlipped = !this.gameGrid[id].isFlipped;
  },
  // Checks if the 2 Items selected are matching or need to be reset.
  processQueue: function() {
    var card1ID = this.matchQueue[0];
    var card2ID = this.matchQueue[1];
    if (this.areCardsMatching(card1ID, card2ID)) {
      this.totalFound += 2;
      this.gameGrid[card1ID].matchedStatus = true;
      this.gameGrid[card2ID].matchedStatus = true;
    } else {
      this.flipCard(card1ID);
      this.flipCard(card2ID);
    }
    this.matchQueue = [];
  }
};

game.createGameGrid(2, 2); // Default game is 4 rows x 5 cols;
game.displayToConsole();
