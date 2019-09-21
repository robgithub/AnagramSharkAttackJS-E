/*

Anagram Shark Attack JS-E
=========================
2019 Rob-on-earth

*/

function Game(name, targetDiv) {
  var game = this; 
  game.targetDiv = targetDiv; 
  var debugLevel = 0;
  var logger = new Logger(debugLevel);
  var level = 0; // waiting to start
  var word = '';
  var tiles = [];
  var words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','seacucumber','nudibranch','bobbitworm','giantclam' ] ];
  var letterPositions = [];  // where letters can be and what state each position is
  var tileWidth = 5;
  var tilePadding = 2;
  var restY="100";


  game.bd = function() {
    return tiles;
  }

  // Public START method
  game.start = function() {
    logger.debug(0, "it has begun");
    level++;
    word = game.getWord(level);
    letterPositions = game.calculateLetterPositions(word);
    var shuffled = game.shuffle(word);
    logger.debug(0, "shuffled word ["+ word +"] is [" + shuffled + "]");
    tiles = game.createTiles(word, letterPositions);
    game.attachTiles(tiles);
  }
  
  // shuffle the letter order
  game.shuffle = function(word) {
    var shuffled = "".padStart(word.length, '_');
    for (var i = 0; i< word.length; i++) {
      var charIndx = Math.floor(Random.getRandomRange(0, word.length));
      while ((shuffled[charIndx] != '_') || ((charIndx == i) && (shuffled.match(/_/g).length != 1) )) {
        charIndx = Math.floor(Random.getRandomRange(0, word.length));
      }
      shuffled = game.replaceAt(shuffled, charIndx, word[i]);
    }
    return shuffled;
  }

  // replace At index in a string
  game.replaceAt = function(word, index, change) {
    var asArray = word.split("");
    asArray[index] = change;
    return asArray.join("");
  }

  // attach tiles to DOM
  game.attachTiles = function(tiles) {
    for (var i = 0; i<tiles.length;i++) {
      document.querySelector(game.targetDiv).append(tiles[i].create());
    }
  }

  // Create all the tile objects
  game.createTiles = function(word, positions) {
    var tileArray = [];
    for (var i = 0; i< word.length;i++) {
      letter = word[i];
      //game.debug(0, "new letter " + letter);
      tileArray.push(new Tile(letter.toUpperCase(), i, positions[i])); 
    }
    return tileArray;
  }
  
  // where do the letters sit in space?
  game.calculateLetterPositions = function(word) {
    // centering formula where 100 === 100%
    // 100 - (100 - ((tileX + padding)*number of letters) / 2)
    var x =  (100 - ((tileWidth + tilePadding) * word.length)) / 2;
    var positions = [];
    positions.push(new LetterPosition(x, restY));
    for (var i = 1; i < word.length; i++) {
      x += tileWidth + tilePadding
      positions.push(new LetterPosition(x, restY));
    }
    return positions;
  }

  // return a random word for the specified level
  game.getWord = function(level) {
    return (words[level-1][Math.floor(Random.getRandomRange(0, words[level-1].length))]);
  };



}

// Title class
function Tile(letter, id, pos) {
  var tile = this;
  tile.letter = letter;
  tile.id = id;
  
  tile.create = function() {
    var element = document.createElement('div');
    element.className = "tile letter-" + letter +" tile-" + tile.id + "";
    element.setAttribute("style","left:" + pos.x + "%;top:" + pos.y + "%");
    var innerElement = document.createElement('div');
    innerElement.className = "inner";
    innerElement.innerHTML = '<svg viewBox="0 0 100 100"><text x="18" y="90%">'+ tile.letter +'</text></svg>';
    element.append(innerElement);
    return element;
  };
}

// Letter position class
function LetterPosition(x, y) {
  var letterPosition = this;
  letterPosition.x = x;
  letterPosition.y = y;
}

// Logger class
function Logger(debugLevel) {
  var logger = this;
  debugLevel = debugLevel;

  // log any debug messages that are at the threshold of debugLevel or below.
  logger.debug = function(debugThreshold, message) {
    if (debugLevel >= debugThreshold) {
      console.log(message);
    }
  }
}

// namespaces for common functions

// Random
var Random = {
  // return random value between 0 and 1.0
  getRandom : function() {
    return Math.random();
  },

  // return random float value between min and max (including min and up to but not including the whole number max)
  // might want to call Math.floor if the value is for an array index.
  getRandomRange : function(min,max) {
    return min + ( max * this.getRandom());
  },
};

