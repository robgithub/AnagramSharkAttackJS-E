/*

Anagram Shark Attack JS-E
=========================
2019 Rob-on-earth

*/
'use strict';
function Game(name, targetDiv) {
  var game = this; 
  game.targetDiv = targetDiv; 
  var debugLevel = 1;
  var logger = new Logger(debugLevel);
  var level = 0; // waiting to start
  var word = '';
  var tiles = [];
  var words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','coelacanth','nudibranch','bobbitworm','giantclam' ] ];
  var tilePositions = [];  // where tiles can be and what state each position is
  var restY="50"; // Resting position of the tiles, percentage
  var maxTileSize = null;
  var tileSize = null;


  game.bd = function() {
    return tiles;
  }

  // Public START method
  game.start = function() {
    logger.debug(0, "it has begun");
    level++;
    word = game.getWord(level);
    var shuffled = game.shuffle(word);
    logger.debug(0, "The word ["+ word +"] is shuffled as [" + shuffled + "]");
    // Word has been selected and shuffled
    var playAreaWidth = document.querySelector(game.targetDiv).getBoundingClientRect().width;
    var tilePadding = 2; // TODO revisit, percentage of tile?
    maxTileSize = game.calculateMaxTileSize(playAreaWidth, word.length, tilePadding);
    logger.debug(1, "calculateMaxTileSize() returned [" + maxTileSize + "]");
    tileSize = game.calculateTileSize(maxTileSize);
    var tileWidth = tileSize.w;
    logger.debug(1, "calculateTileSize() returned [" + tileSize.w + ", " + tileSize.h + "]");
    tilePositions = game.calculateTilePositions(word, playAreaWidth, tileWidth, tilePadding);
    tiles = game.createTiles(shuffled, tilePositions, tileSize);
    game.attachTiles(tiles);
  }
  
  // calculate the tile size based on playarea
  // returns a TileSize object
  game.calculateTileSize = function(max){
    var size = new TileSize(max,max);
    return size; // TODO base on targeDiv size
  }
  
  // calculate the maximum possible tile size based on playarea
  // returns a single integer representing the maximum number of pixels a tile can be in height(and width)
  // based on the max number of tiles per word, might change in the future
  game.calculateMaxTileSize = function(playAreaWidth, wordLength, tilePadding){
    var result = (playAreaWidth - ((wordLength + 2 + 1) * tilePadding)) / (wordLength + 2);
    return result;
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
  game.createTiles = function(word, positions, tileSize) {
    var tileArray = [];
    for (var i = 0; i< word.length;i++) {
      var letter = word[i];
      tileArray.push(new Tile(letter.toUpperCase(), i, positions[i], tileSize)); 
    }
    return tileArray;
  }
  
  // where do the Tile sit in space?
  game.calculateTilePositions = function(word, playAreaWidth, tileWidth, tilePadding) {
    logger.debug(1, "calculateTilePositions() tileWidth = [" + tileWidth + "] tilePadding = [" + tilePadding + "]");
    var x = (playAreaWidth - ((tileWidth + tilePadding) * word.length)) /2;
    logger.debug(1, "calculateTilePositions() playAreaWidth = [" + playAreaWidth + "] initial x = [" + x + "]");
    var positions = [];
    positions.push(new TilePosition(x, restY));
    for (var i = 1; i < word.length; i++) {
      x += tileWidth + tilePadding
      positions.push(new TilePosition(x, restY));
    }
    return positions;
  }

  // return a random word for the specified level
  game.getWord = function(level) {
    return (words[level-1][Math.floor(Random.getRandomRange(0, words[level-1].length))]);
  };



}

// Title class
function Tile(letter, id, pos, size) {
  var tile = this;
  tile.letter = letter;
  tile.id = id;
  tile.pos = pos;
  tile.size = size;
  
  tile.create = function() {
    var element = document.createElement('div');
    element.className = "tile letter-" + tile.letter +" tile-" + tile.id + "";
    element.setAttribute("style","left:" + tile.pos.x + "px;top:" + tile.pos.y + "%;width:" + tile.size.w + "px;height:" + tile.size.h + "px");
    var innerElement = document.createElement('div');
    innerElement.className = "inner";
    innerElement.innerHTML = '<svg viewBox="0 0 100 100"><text x="18" y="90%">'+ tile.letter +'</text></svg>';
    element.append(innerElement);
    return element;
  };
}

// Tile position class
function TilePosition(x, y) {
  var tilePosition = this;
  tilePosition.x = x;
  tilePosition.y = y;
}

// Tile size class
function TileSize(w, h) {
  var tileSize = this;
  tileSize.w = w;
  tileSize.h = h;
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

