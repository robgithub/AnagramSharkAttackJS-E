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
  var words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','seacucumber','nudibranch','bobbitworm','giantclam' ] ];

  game.start = function() {
    game.debug(0, "it has begun");
    tiles.push(new tile('S'));
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

