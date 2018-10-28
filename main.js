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
  game.createGameGrid(4); // Default game is 4 rows x 5 cols;
  game.displayToWindow();
});

// Game Object and Methods
var game = {
  gameGrid: [],
  matchQueue: [],
  rows: 4,
  cols: 5,
  totalClickCount: 0,
  totalFound: 0,
  coverLetter: '🀄',
  valueArray: [
    '🍅',
    '🍆',
    '🍇',
    '🍉',
    '🍊',
    '🍌',
    '🍍',
    '🍎',
    '🍏',
    '🍑',
    '🍔',
    '🍕',
    '🍖',
    '🍗',
    '🍦'
  ],
  // Generate Grid for Game. If arguments are not passed default values are used to choose size
  createGameGrid: function(rows) {
    try {
      // if rows * cols is not even number, throw error
      if ((rows * this.cols) % 2 === 1) {
        throw 'Total cards is an odd number!';
      }
      this.rows = rows;
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
  // Create Reference Values for Game - Used to generate a range array with 2 of each number
  createMatchValues: function(totalValues) {
    var result = [];
    for (var i = 0; i < totalValues / 2; i++) {
      result.push(i);
    }
    return result.concat(result);
  },
  // Debug Display for Console - Diagnostic Use Only
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
  // Display Grid to Window
  displayToWindow: function() {
    var mainContainer = document.getElementById('main');
    mainContainer.innerText = ''; // Empty Main Contents

    // create clicksContainer
    var newSection = document.createElement('section');
    newSection.classList.add('clicksContainer');
    newSection.setAttribute('id', 'clicksContainer');
    mainContainer.appendChild(newSection);

    // create gameContainer
    newSection = document.createElement('section');
    newSection.classList.add('gameContainer');
    newSection.setAttribute('id', 'gameContainer');
    mainContainer.appendChild(newSection);

    // create foundContainer
    newSection = document.createElement('section');
    newSection.classList.add('foundContainer');
    newSection.setAttribute('id', 'foundContainer');
    mainContainer.appendChild(newSection);

    // add content to clicksContainer - Clicks so Far
    var clicksContainer = document.getElementById('clicksContainer');
    var counterElement = document.createElement('div');
    counterElement.innerText = `Total Clicks: ${this.totalClickCount}`;
    clicksContainer.appendChild(counterElement);

    // add content to gamesContainer - Game Content
    var count = 0;
    var gameContainer = document.getElementById('gameContainer');
    for (var i = 0; i < this.rows; i++) {
      var cardRowContainer = document.createElement('div');
      cardRowContainer.classList.add('cardRowContainer');
      for (var j = 0; j < this.cols; j++) {
        var card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('id', this.gameGrid[count].id);
        card.innerText = this.coverLetter;
        cardRowContainer.appendChild(card);
        count++;
      }
      gameContainer.appendChild(cardRowContainer);
    }

    // add content to foundContainer - Pairs Found
    var foundContainer = document.getElementById('foundContainer');
    var foundElement = document.createElement('div');
    foundElement.innerText = `Total Found: ${this.totalFound}`;
    foundContainer.appendChild(foundElement);

    // Event Listener for cards
    gameContainer.addEventListener('click', function clickCards(event) {
      if (event.target.className === 'card') {
        handlers.activateTurn(event.target.id);
      }
    });
  },
  // checks if the two cards are matching & returns boolean
  areCardsMatching: function(cardId1, cardId2) {
    return (
      this.gameGrid[cardId1].matchValue === this.gameGrid[cardId2].matchValue
    );
  }
};

// HTML Handlers
var handlers = {
  increaseClickCount: function() {
    game.totalClickCount++;
    var totalClickCountElement = document.getElementById('clicksContainer')
      .children[0];
    totalClickCountElement.innerText = `Total Clicks: ${game.totalClickCount}`;
  },
  increaseFoundTotal: function() {
    game.totalFound += 2;
    var totalFoundElement = document.getElementById('foundContainer')
      .children[0];
    totalFoundElement.innerText = `Total Found: ${game.totalFound}`;
  },
  flipCard: function(id) {
    var cardElement = document.getElementById(id);
    var card = game.gameGrid[id];
    if (card.isFlipped === true) {
      cardElement.innerText = game.coverLetter;
    } else {
      cardElement.innerText = game.valueArray[card.matchValue];
    }
    game.gameGrid[id].isFlipped = !game.gameGrid[id].isFlipped;
  },
  addToMatchQueue: function(id) {
    game.matchQueue.push(id);
    // check if queue is full
    if (game.matchQueue.length === 2) {
      // matching Queue has 2 items. Process.
      this.processQueue();
    }
  },
  processQueue: function() {
    var card1ID = game.matchQueue[0];
    var card2ID = game.matchQueue[1];
    if (game.areCardsMatching(card1ID, card2ID)) {
      this.increaseFoundTotal();
      game.gameGrid[card1ID].matchedStatus = true;
      game.gameGrid[card2ID].matchedStatus = true;
    } else {
      setTimeout(
        function() {
          this.flipCard(card1ID);
          this.flipCard(card2ID);
        }.bind(this),
        1000
      );
    }
    game.matchQueue = [];
  },
  // Runs a turn with the the selected card's id being passed as argument
  activateTurn: function(id) {
    // check that matchedStatus is false and that item is not currently in matchQueue
    if (
      game.gameGrid[id].matchedStatus === false &&
      game.matchQueue.indexOf(id) === -1
    ) {
      this.increaseClickCount();
      this.flipCard(id); // flip the card
      this.addToMatchQueue(id); // push item into matching Queue
    }

    if (game.totalFound === game.rows * game.cols) {
      console.log('Game Over: All pairs found!');
      // send Message to Dom and End Game
    }
  }
};
