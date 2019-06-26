/*

Anagram Shark Attack JS-E
=========================
2019 Rob-on-earth

*/

function game(name, targetDiv) {
  var game = this; 
  game.targetDiv = targetDiv; 
  var debugLevel = 0;
  var tiles = [];

  game.start = function() {
    game.debug(0, "it has begun");
    tiles.push(new tile());
    document.querySelector(game.targetDiv).append(tiles[0].create());
  }


	// return random value between 0 and 1.0
	game.getRandom = function() {
		return Math.random();
	};

	// return random float value between min and max (including min and up to but not including the whole number max)
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

function tile() {
  var tile = this;
  
  tile.create = function() {
    var element = document.createElement('div');
    element.className = "tile";
    var innerElement = document.createElement('div');
    innerElement.className = "inner";
    innerElement.innerHTML = "K";
    element.append(innerElement);
    return element;
  };
}

