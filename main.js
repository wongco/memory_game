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
  landingView.start();
});

var landingView = {
  start: function() {
    view.removeGameEventListeners();
    var body = document.getElementById('body');
    body.classList.remove('body-game');
    body.classList.add('body-start');

    var main = document.getElementById('main');
    main.innerText = '';
    main.classList.remove('main-game');
    main.classList.add('main-start');

    var newElement = document.createElement('div');
    newElement.classList.add('header--main');
    newElement.innerText =
      "I'm sorry, Dave. I'm afraid I can't let you leave without playing.";
    main.appendChild(newElement);

    newElement = document.createElement('button');
    newElement.classList.add('button--main');
    newElement.innerText = 'Play Game';
    main.appendChild(newElement);
    this.setUpLandingEventListeners();

    var lowScore = localStorage.getItem('lowScore');
    if (lowScore != undefined) {
      newElement = document.createElement('div');
      newElement.classList.add('div--score');
      newElement.innerText = `Record Low Score: ${lowScore}`;
      main.appendChild(newElement);
    }

    // if localStorage exists, append Div with lowest Score to bottom of page
  },
  clickButton: function(event) {
    if (event.target.className === 'button--main') {
      view.startGame();
    }
  },
  setUpLandingEventListeners: function() {
    var main = document.getElementById('main');
    // Event Listener for button
    main.addEventListener('click', this.clickButton);
  },
  removeLandingEventListeners: function() {
    var main = document.getElementById('main');
    if (main != null) {
      main.removeEventListener('click', this.clickButton);
    }
  }
};

// Game Object and Related Functions
var game = {
  gameGrid: [],
  matchQueue: [],
  rows: 4,
  cols: 5,
  totalClickCount: 0,
  totalFound: 0,
  coverLettersArray: ['🎧', '🎮', '🎱', '🏆', '🆒'],
  coverLetter: '',
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
  createGameGrid: function() {
    try {
      // if rows * cols is not even number, throw error
      if ((this.rows * this.cols) % 2 === 1) {
        throw 'Total cards is an odd number!';
      }
      // Reinitialize Values for New Game
      this.gameGrid = [];
      this.matchQueue = [];
      this.totalClickCount = 0;
      this.totalFound = 0;
      this.coverLetter = this.coverLettersArray[Math.floor(Math.random() * 5)];
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
      view.completeGame();
    }
  }
};

// View Related Functions
var view = {
  // Debug Display for Console - Diagnostic Use Only
  displayToConsole: function() {
    var count = 0;
    for (var i = 0; i < game.rows; i++) {
      var rowDisplayStr = '';
      for (var j = 0; j < game.cols; j++) {
        var card = game.gameGrid[count];
        rowDisplayStr += ` [id:${card.id},${card.matchValue},${
          card.matchedStatus
        },`;
        rowDisplayStr += card.isFlipped === true ? `ON] ` : `OFF] `;
        count++;
      }
      console.log(rowDisplayStr);
    }
    console.log(`Total click count: ${game.totalClickCount}`);
    console.log(`Total found count: ${game.totalFound}`);
  },
  // Display Grid to Window
  displayGameToWindow: function() {
    var body = document.getElementById('body');
    body.classList.remove('body-start');
    body.classList.add('body-game');

    var mainContainer = document.getElementById('main');
    mainContainer.classList.remove('main-start');
    mainContainer.classList.add('main-game');
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
    counterElement.innerText = `Total Clicks: ${game.totalClickCount}`;
    clicksContainer.appendChild(counterElement);

    // add content to gamesContainer - Game Content
    var count = 0;
    var gameContainer = document.getElementById('gameContainer');
    for (var i = 0; i < game.rows; i++) {
      var cardRowContainer = document.createElement('div');
      cardRowContainer.classList.add('cardRowContainer');
      for (var j = 0; j < game.cols; j++) {
        var card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('id', game.gameGrid[count].id);
        card.innerText = game.coverLetter;
        cardRowContainer.appendChild(card);
        count++;
      }
      gameContainer.appendChild(cardRowContainer);
    }

    // add content to foundContainer - Pairs Found
    var foundContainer = document.getElementById('foundContainer');
    var foundElement = document.createElement('div');
    foundElement.innerText = `Total Found: ${game.totalFound}`;
    foundContainer.appendChild(foundElement);
  },
  clickCards: function(event) {
    if (event.target.className === 'card') {
      handlers.activateTurn(event.target.id);
    }
  },
  setUpGameEventListeners: function() {
    var gameContainer = document.getElementById('gameContainer');
    // Event Listener for cards
    gameContainer.addEventListener('click', this.clickCards);
  },
  removeGameEventListeners: function() {
    var gameContainer = document.getElementById('gameContainer');
    if (gameContainer != null) {
      gameContainer.removeEventListener('click', this.clickCards);
    }
  },
  completeGame: function() {
    var lowScore = localStorage.getItem('lowScore');
    var gameContainer = document.getElementById('gameContainer');
    var completeElement = document.createElement('div');
    completeElement.classList.add('completeElement');
    if (lowScore != undefined) {
      if (game.totalClickCount < lowScore) {
        localStorage.setItem('lowScore', game.totalClickCount);
        completeElement.innerText =
          "Congratulations! You've set a new low score!";
      } else {
        completeElement.innerText =
          "Congratulations! You've completed the game!";
      }
    }
    gameContainer.appendChild(completeElement);

    var buttonElement = document.createElement('button');
    buttonElement.classList.add('button--leave');
    buttonElement.innerText = 'Return Home';
    gameContainer.appendChild(buttonElement);

    buttonElement = document.querySelector('.button--leave');
    buttonElement.addEventListener('click', homeButton);

    function homeButton(event) {
      if (event.target.className === 'button--leave') {
        buttonElement.removeEventListener('click', homeButton);
        landingView.start();
      }
    }
  },
  startGame: function() {
    landingView.removeLandingEventListeners();
    game.createGameGrid(); // Default game is 4 rows x 5 cols;
    this.displayGameToWindow();
    this.setUpGameEventListeners();
  }
};
