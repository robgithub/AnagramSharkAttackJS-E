/*

Anagram Shark Attack JS-E
=========================
2019 Rob-on-earth

*/

function letterPosition(x) {
  var letterPosition = this;
  letterPosition.x = x;
}

function game(name, targetDiv) {
  var game = this; 
  game.targetDiv = targetDiv; 
  var debugLevel = 0;
  var level = 0; // waiting to start
  var word = '';
  var tiles = [];
  var words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','seacucumber','nudibranch','bobbitworm','giantclam' ] ];
  var letterPositions = [];  // where letters can be and what state each position is
  var tileWidth = 5;
  var tilePadding = 2;

  // Public START method
  game.start = function() {
    game.debug(0, "it has begun");
    level++;
    word = game.getWord(level);
    letterPositions = game.calculateLetterPositions(word);
    tiles = game.createTiles(word, letterPositions);
    document.querySelector(game.targetDiv).append(tiles[0].create());
  }

  // Create all the tile objects
  game.createTiles = function(word, positions) {
    var tileArray = [];
    for (var i = 0; i< word.length;i++) {
      letter = word[i];
      tileArray.push(new tile(letter.toUpperCase()));
    }
    return tileArray;
  }
  
  // where do the letters sit in space?
  game.calculateLetterPositions = function(word) {
    // centering formula where 100 === 100%
    // 100 - (100 - ((tileX + padding)*number of letters) / 2)
    var x =  (100 - ((tileWidth + tilePadding) * word.length)) / 2;
    var positions = [];
    positions.push(new letterPosition(x));
    for (var i = 1; i <= word.length; i++) {
      x += tileWidth + tilePadding
      positions.push(new letterPosition(x));
    }
    return positions;
  }

  // return a random word for the specified level
  game.getWord = function(level) {
    return (words[level-1][Math.floor(game.getRandomRange(0, words[level-1].length))]);
  };

  // return random value between 0 and 1.0
  game.getRandom = function() {
    return Math.random();
  };

  // return random float value between min and max (including min and up to but not including the whole number max)
  // might want to call Math.floor if the value is for an array index.
  game.getRandomRange = function(min,max) {
    return min + ( max * this.getRandom());
  };

  // log any debug messages that are at the threshold of debugLevel or below.
  game.debug  = function(debugThreshold, message) {
    if (debugLevel >= debugThreshold) {
      console.log(message);
    }
  }

}

function tile(letter) {
  var tile = this;
  tile.letter = letter;
  
  tile.create = function() {
    var element = document.createElement('div');
    element.className = "tile";
    var innerElement = document.createElement('div');
    innerElement.className = "inner";
    innerElement.innerHTML = '<svg viewBox="0 0 100 100"><text x="18" y="90%">'+ tile.letter +'</text></svg>';
    element.append(innerElement);
    return element;
  };
}

