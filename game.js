/*
snap
Anagram Shark Attack JS-E
=========================
2019 Rob-on-earth

*/
'use strict';
function Game(name, targetDiv) {
  // "name" is not currently used in any way, could be title text
  var game = this; // our instance
  game.targetDiv = targetDiv; // save the targetDiv as passed to the Game by the initialisation code
  var debugLevel = 1; // only show debug messages to this depth
  var logger = new Logger(debugLevel); // create an instance of the Logger class to do logging
  var level = 0; // waiting to start
  var word = ''; // the current word for the level
  var tiles = []; // all the tile instances
  // TODO:: set as const if possible
  var words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','coelacanth','nudibranch','bobbitworm','giantclam' ] ];
  var tilePositions = [];  // where tiles can be and what state each position is
  var restY=40; // Resting position of the tiles, percentage
  var maxTileSize = null; // to be calculated
  var tileSize = null; // to be calculated
  const baseTileZIndex = 10;

  // example debug to return the instance of a tiles, otherwise everything is private
  // example when code running game1.surfaceTiles();
  game.surfaceTiles = function() {
    return tiles;
  }
  game.surfaceTilePositions = function() {
    return tilePositions;
  }

  // Public START method
  game.start = function() {
    logger.debug(0, "it has begun");
    level++; // move from level=0 to level=1
    word = game.getWord(level); // get the random word from the requested level, higher the level the longer the words get
    var shuffled = game.shuffle(word); // create a shuffled version of the word ready to be descrambled
    logger.debug(0, "The word ["+ word +"] is shuffled as [" + shuffled + "]");
    // Word has been selected and shuffled
    var playArea = document.querySelector(game.targetDiv).getBoundingClientRect(); // Get the play area to determine the Tile size
    var tilePadding = 2; // TODO:: revisit, percentage of tile?
    maxTileSize = game.calculateMaxTileSize(playArea.width, word.length, tilePadding); // based on play area, word length and tile padding, work out the maximum possible tile size
    logger.debug(1, "calculateMaxTileSize() returned [" + maxTileSize + "]");
    tileSize = game.calculateTileSize(maxTileSize); // from the maximum tile size determine the best actuall size.
    var tileWidth = tileSize.w; // TODO:: why are we creating a new variable?
    logger.debug(1, "calculateTileSize() returned [" + tileSize.w + ", " + tileSize.h + "]");
    tilePositions = game.calculateTilePositions(word, playArea, tileWidth, tilePadding); // locate the physical tile positions for the Tiles - this is then the list of possible position that Tiles should conform to.
    tiles = game.createTiles(shuffled, tilePositions, tileSize); // create the Tile objects from the shuffled word, the tile positions and the tileSize
    game.attachTiles(tiles); // Attach the Tile divs to the draggable area and assign the draggable events to the tiles. Also adds the initial startup Bob animation, via random delay
    // create game loop
    game.animate();
  }
  
  // Game animation loop
  game.animate = function(timeStamp) {
    // check if any objects need animating
    const animatableTiles = tiles.filter(x => x.userDropped);
    animatableTiles.forEach(function(tile) {
        if (tile.animation.timeStampStart == 0) {
            tile.animation.timeStampStart = timeStamp; // record the initial frame the animation starts
            tile.animation.duration = 2 * 1000; // 2 seconds
            tile.animation.fromPosition = {x:parseFloat(tile.element.style.left.slice(0,-2)), y:parseFloat(tile.element.style.top.slice(0,-2))}; // record the start position as numbers
            tile.animation.toPosition = game.getClosestTilePosition(tilePositions, tile.animation.fromPosition.x, restY, tileSize);
            // calculate the distance to the toPosition, as this is the path we want to animate.
            tile.animation.toDistance.x = tile.animation.toPosition.x - tile.animation.fromPosition.x;
            tile.animation.toDistance.y = tile.animation.toPosition.y - tile.animation.fromPosition.y;
            game.orderTiles(tiles, tile);
        } else {
            // we have work to do.
            let timeFraction = (timeStamp - tile.animation.timeStampStart) / tile.animation.duration;
            if (timeFraction > 1) { 
                timeFraction = 1;
                tile.userDropped = false; // we have reached our destination
                tile.animation.timeStampStart = 0;
            } 
            // timeFraction is the value between 0.0 - 1.0 that defines the progress of the animation, so 0.5 is half way.
            // Move the tile
            logger.debug(3, "Tile["+ tile.letter +"] current left [" + tile.element.style.left + "] From.x [" + tile.animation.fromPosition.x + "] + calculated increase = [" + (tile.animation.toDistance.x * timeFraction)+ "] new value [" + (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + "]");
            tile.element.style.left = (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + 'px';
            tile.element.style.top  = (tile.animation.fromPosition.y + (tile.animation.toDistance.y * timeFraction)) + 'px';
            logger.debug(0, "Tile["+ tile.letter +"]timeFraction = " + timeFraction);
        }
    });
    //logger.debug(0, "length of animatable tiles "+ animatableTiles.length);
    requestAnimationFrame(game.animate);
  }
  
  // set CSS z-index for new tile ordering
  // to be called during requestAnimationFrame
  game.orderTiles = function(tiles, topTile) {
    let total = tiles.length;
    let oldZ = topTile.element.style.zIndex;
    tiles.forEach(function(tile) {
        if (tile.element.style.zIndex > oldZ) {
            tile.element.style.zIndex--;
        } else if (tile.element.style.zIndex == oldZ) {
            tile.element.style.zIndex = baseTileZIndex + total;
        }
    });
  }
  
  // calculate the tile size based on playarea
  // returns a TileSize object
  // Allows additional checks on available space after initial calculation purely on Width
  game.calculateTileSize = function(max){
    var size = new TileSize(max, max);
    return size; // TODO base on targeDiv size
  }
  
  // calculate the maximum possible tile size based on playarea
  // returns a single integer representing the maximum number of pixels a tile can be in height(and width)
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

  // attach tiles to DOM as draggable elements
  game.attachTiles = function(tiles) {
    var targetDiv = document.querySelector(game.targetDiv);
    for (var i = 0; i<tiles.length;i++) {
      var newTile = tiles[i].create();
      tiles[i].element = newTile;
      newTile.hidden = true; // Start hidden before the "bob" animation
      document.querySelector(game.targetDiv).append(newTile);
      new DraggableElement(newTile, targetDiv, tiles[i]);
      setTimeout(game.tileBobUp, Random.getRandomRange(100, 1000), newTile);
    }
  }

  // Bob-up tile
  // removes the class if required before unhiding the element and applying the class
  game.tileBobUp = function(element) {
    element.hidden = false;
    element.classList.remove('bob-up');
    element.classList.add('bob-up');
  }

  // Create all the tile objects
  game.createTiles = function(word, positions, tileSize) {
    var tileArray = [];
    for (var i = 0; i< word.length;i++) {
      var letter = word[i];
      tileArray.push(new Tile(letter.toUpperCase(), i, positions[i], tileSize, baseTileZIndex + i)); 
    }
    return tileArray;
  }
  
  // where do the Tile sit in space?
  game.calculateTilePositions = function(word, playArea, tileWidth, tilePadding) {
    logger.debug(1, "calculateTilePositions() tileWidth = [" + tileWidth + "] tilePadding = [" + tilePadding + "]");
    var x = (playArea.width - ((tileWidth + tilePadding) * word.length)) /2;
    logger.debug(1, "calculateTilePositions() playArea.width = [" + playArea.width + "] initial x = [" + x + "]");
    var positions = [];
    positions.push(new TilePosition(x, (restY / 100) * playArea.height )); 
    for (var i = 1; i < word.length; i++) {
      x += tileWidth + tilePadding
      positions.push(new TilePosition(x, (restY / 100) * playArea.height ));
    }
    return positions;
  }
  
  // Get the closest in Horizontal plane tile position
  // for animtating tile drops and them homing-in on the correct tile column
  game.getClosestTilePosition = function(tilePositions, x, restY, tileSize) {
    var playArea = document.querySelector(game.targetDiv).getBoundingClientRect();
    var closest = {x:"-1000", y:( (restY / 100) * playArea.height )}; /* record the destination position */
    var closestPosition = {index:-1, distance:100000 };
    for (var i=0; i<tilePositions.length; i++) {
      var distance = ( Math.max(tilePositions[i].x, x) - Math.min(tilePositions[i].x, x) );
      if ( distance < closestPosition.distance ) {
        closestPosition.distance = distance;
        closestPosition.index = i;
      }
      distance = ( Math.max(tilePositions[i].x + tileSize.Width, x) - Math.min(tilePositions[i].x + tileSize.Width, x) );
      if ( distance < closestPosition.distance ) {
        closestPosition.distance = distance;
        closestPosition.index = i;
      }
    }
    if (closestPosition.index == -1) {
      throw "Anagram Shark Attack JS-E could not calculate a closest tile position for the given value x=[" + x + "]";
    }
    closest.x = tilePositions[closestPosition.index].x;
    return closest;
  }

  // return a random word for the specified level
  game.getWord = function(level) {
    return (words[level-1][Math.floor(Random.getRandomRange(0, words[level-1].length))]);
  };



}

// Title class
function Tile(letter, id, pos, size, zIndex) {
  var tile = this;
  tile.letter = letter;
  tile.id = id;
  tile.pos = pos;
  tile.size = size;
  tile.userDropped = false;
  // TODO:: make this reusable animation class
  tile.animation = {timeStampStart:0, duration:0, fromPosition:{x:0, y:0}, toPosition:{x:0, y:0}, toDistance:{x:0, y:0}};
  tile.element = null;
  
  tile.create = function() {
    var element = document.createElement('div');
    element.className = "tile no-select letter-" + tile.letter +" tile-" + tile.id + "";
    element.setAttribute("style","left:" + tile.pos.x + "px;top:" + tile.pos.y + "px;width:" + tile.size.w + "px;height:" + tile.size.h + "px");
    element.style.zIndex = zIndex;
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

// DraggableElement class
// where draggableArea is the element the dragging will occur in
function DraggableElement(element, draggableArea, tile) {
  var draggableElement = this;
  draggableElement.element = element;
  draggableElement.draggableArea = draggableArea;
  draggableElement.offsetLeft = 0;
  draggableElement.offsetTop = 0;
  draggableElement.tile = tile; // instance of the tile that is draggable. Makes this class non-longer tile object agnostic, but required to able to get at the tilte specific attrributes. 
  // TODO::Could be refactored with events so we do not touch the tile attributes?
  
  // bind the mousedown event to the element we want to drag
  draggableElement.element.addEventListener("mousedown", function (e) { 
    draggableElement.initateDrag(this, e);
    return false;
  }, true);
  // bind the touchstart event to the element we want to drag
  draggableElement.element.addEventListener("touchstart", function (e) { 
    draggableElement.initateDrag(this, e);
    return false;
  }, true);
  // start with element not being dragged until user activity 
  draggableElement.element = null;
  
  // set the draggable element, called from the mouse down event
  draggableElement.initateDrag = function(element, e) {
    draggableElement.element = element; 
    if (e.type=="mousedown") {
      draggableElement.offsetLeft = e.clientX - draggableElement.element.offsetLeft;
      draggableElement.offsetTop  = e.clientY - draggableElement.element.offsetTop;
      draggableElement.draggableArea.addEventListener("mousemove", draggableElement.dragElement, false);
    } else if(e.type=="touchstart") { 
      draggableElement.offsetLeft = e.targetTouches[0].clientX - draggableElement.element.offsetLeft;
      draggableElement.offsetTop  = e.targetTouches[0].clientY - draggableElement.element.offsetTop;
      draggableElement.draggableArea.addEventListener("touchmove", draggableElement.dragElement, false);
    }
  }

  // Drag element where ever the mouse is
  draggableElement.dragElement = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggableElement.element) {
      if (e.type=="mousemove") {
        draggableElement.element.style.left = (e.clientX - draggableElement.offsetLeft)  + 'px';
        draggableElement.element.style.top =  (e.clientY - draggableElement.offsetTop)   + 'px';
      } else if(e.type=="touchmove") { 
        draggableElement.element.style.left = (e.targetTouches[0].clientX - draggableElement.offsetLeft)  + 'px';
        draggableElement.element.style.top =  (e.targetTouches[0].clientY - draggableElement.offsetTop)   + 'px';
      }
      draggableElement.element.style.zIndex = 100; // when dragging always on top, ordering happens when the tile is dropped
      draggableElement.tile.userDropped = false;
      draggableElement.tile.animation.timeStampStart = 0;
    }
  }

  // Stop dragging element
  draggableElement.stopDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggableElement.element) {
      draggableElement.draggableArea.removeEventListener("mousemove", draggableElement.dragElement);
      draggableElement.draggableArea.removeEventListener("touchmove", draggableElement.dragElement);
      draggableElement.element = null;
      draggableElement.tile.userDropped = true; // main animation loop will identify a tile that needs to be animated to its nearest column position
    }
  }

  draggableElement.draggableArea.addEventListener("mouseup", draggableElement.stopDrag, false);
  draggableElement.draggableArea.addEventListener("mouseleave", draggableElement.stopDrag, false);
  draggableElement.draggableArea.addEventListener("touchend", draggableElement.stopDrag, false);
  draggableElement.draggableArea.addEventListener("touchcancel", draggableElement.stopDrag, false);
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

