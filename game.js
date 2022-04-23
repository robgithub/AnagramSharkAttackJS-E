/*
snap
Anagram Shark Attack JS-E
=========================
2020 Rob-on-earth

*/
'use strict';
function Game(name, targetDiv) {
  // "name" is not currently used in any way, could be title text
  let game = this; // our instance
  game.targetDiv = targetDiv; // save the targetDiv as passed to the Game by the initialisation code
  const debugLevel = 1; // only show debug messages to this depth
  const logger = new Logger(debugLevel); // create an instance of the Logger class to do logging
  let level = 0; // waiting to start
  let word = ''; // the current word for the level
  let tiles = []; // all the tile instances
  const words = [ ['fish','boat','ship','crab','tuna'], ['ocean','whale','shark','waves','shrimp' ], ['lobster','dolphin','octopus','seaweed','penguin' ], ['barnacle','seasnake','morayeel','mantaray','flyingfish' ], ['jellyfish','clownfish','bluewhale','swordfish','nautilus' ], ['pufferfish','coelacanth','nudibranch','bobbitworm','giantclam' ] ];
  let tilePositions = [];  // where tiles can be and what state each position is
  let restY = 40; // Resting position of the tiles, percentage
  let tileTop = -1; // for when restY creates a non whole number
  let maxTileSize = null; // to be calculated
  let tileSize = null; // to be calculated
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
    // create game loop for animations
    game.animate();
    game.newLevel();
  }
  
  // initiate a new level - will destroy all the previous elements if they exist
  game.newLevel = function() {
    level++; // move from level=0 to level=1
    if (level > words.length) {
        throw "Anagram Shark Attack JS-E has no more levels" // TODO:: handle this gracefully
    }
    word = game.getWord(level); // get the random word from the requested level, higher the level the longer the words get
    let shuffled = game.shuffle(word); // create a shuffled version of the word ready to be descrambled
    logger.debug(0, "The word ["+ word +"] is shuffled as [" + shuffled + "]");
    // Word has been selected and shuffled
    let playArea = document.querySelector(game.targetDiv).getBoundingClientRect(); // Get the play area to determine the Tile size
    tileTop = Math.round( (restY / 100) * playArea.height );
    let tilePadding = 2; // TODO:: revisit, percentage of tile?
    maxTileSize = game.calculateMaxTileSize(playArea.width, word.length, tilePadding); // based on play area, word length and tile padding, work out the maximum possible tile size
    logger.debug(3, "calculateMaxTileSize() returned [" + maxTileSize + "]");
    tileSize = game.calculateTileSize(maxTileSize); // from the maximum tile size determine the best actual size.
    let tileWidth = tileSize.w; // TODO:: why are we creating a new variable?
    logger.debug(3, "calculateTileSize() returned [" + tileSize.w + ", " + tileSize.h + "]");
    tilePositions = game.calculateTilePositions(word, playArea, tileWidth, tilePadding); // locate the physical tile positions for the Tiles - this is then the list of possible positions that Tiles should conform to.
    if (tiles.length > 0) {
        tiles.forEach(function(tile) {
            tile.element.remove();
        });
    }
    tiles = game.createTiles(shuffled, tilePositions, tileSize); // create the Tile objects from the shuffled word, the tile positions and the tileSize
    game.attachTiles(tiles); // Attach the Tile divs to the draggable area and assign the draggable events to the tiles. Also adds the initial startup Bob animation, via random delay
  }
  
  // Game animation loop - called once per frame as conditions allow.
  game.animate = function(timeStamp) {
    // check if any objects need animating for USERDROPPED
    let animatableTiles = tiles.filter(x => x.state == TileState.USERDROPPED);
    animatableTiles.forEach(function(tile) {
        // this is animatable tile has it got a timeStampStart yet?
        if (tile.animation.timeStampStart == 0) {
            tile.animation.timeStampStart = timeStamp; // record the initial frame the animation starts
            tile.animation.duration = 2 * 200; // .2 seconds
            tile.animation.fromPosition = {x:parseFloat(tile.element.style.left.slice(0,-2)), y:parseFloat(tile.element.style.top.slice(0,-2))}; // record the start position as numbers
            tile.animation.toPosition = game.getClosestTilePosition(tilePositions, tile.animation.fromPosition.x, tileTop, tileSize, null);
            // calculate the distance to the toPosition, as this is the path we want to animate.
            tile.animation.toDistance.x = tile.animation.toPosition.x - tile.animation.fromPosition.x;
            tile.animation.toDistance.y = tile.animation.toPosition.y - tile.animation.fromPosition.y;
            game.orderTiles(tiles, tile);
        } else {
            // we have work to do.
            let timeFraction = (timeStamp - tile.animation.timeStampStart) / tile.animation.duration; 
            if (timeFraction > 1) { 
                timeFraction = 1; // cannot go beyond the animation end
            } 
            // timeFraction is the value between 0.0 - 1.0 that defines the progress of the animation, so 0.5 is half way.
            // Move the tile
            logger.debug(3, "Tile["+ tile.letter +"] current left [" + tile.element.style.left + "] From.x [" + tile.animation.fromPosition.x + "] + calculated increase = [" + (tile.animation.toDistance.x * timeFraction)+ "] new value [" + (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + "]");
            tile.element.style.left = (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + 'px';
            tile.element.style.top  = (tile.animation.fromPosition.y + (tile.animation.toDistance.y * timeFraction)) + 'px';
            logger.debug(3, "Tile["+ tile.letter +"]timeFraction = " + timeFraction);
            if ( timeFraction == 1 ) {
                tile.state = TileState.NONE; // we have reached our destination
                tile.animation.timeStampStart = 0; // for future instances
                game.bumpTiles(tiles, tilePositions, tile, tileSize); // do we need new animations for tiles that exist in the same location, defying the laws of science
                if (game.checkWord(tilePositions, tiles)) { game.progressToNextLevel(tiles);  }            
            } 
        }
    });
    // check if any objects need animating for GAMEBUMPED // TODO: why can this not use the EXACT SAME code as USERDROPPED?
    animatableTiles = tiles.filter(x => x.state == TileState.GAMEBUMPED);
    animatableTiles.forEach(function(tile) {
        // this is animatable tile has it got a timeStampStart yet?
        if (tile.animation.timeStampStart == 0) {
            tile.animation.timeStampStart = timeStamp; // record the initial frame the animation starts
            game.orderTiles(tiles, tile);
            // all the other parameters are set in the bumpTiles function
        } else { 
            // we have work to do.
            let timeFraction = (timeStamp - tile.animation.timeStampStart) / tile.animation.duration; 
            if (timeFraction > 1) { 
                timeFraction = 1; // cannot go beyond the animation end
            } 
            // timeFraction is the value between 0.0 - 1.0 that defines the progress of the animation, so 0.5 is half way.
            // Move the tile
            logger.debug(3, "Bump Tile["+ tile.letter +"] current left [" + tile.element.style.left + "] From.x [" + tile.animation.fromPosition.x + "] + calculated increase = [" + (tile.animation.toDistance.x * timeFraction)+ "] new value [" + (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + "]");
            tile.element.style.left = (tile.animation.fromPosition.x + (tile.animation.toDistance.x * timeFraction)) + 'px';
            tile.element.style.top  = (tile.animation.fromPosition.y + (tile.animation.toDistance.y * timeFraction)) + 'px';
            logger.debug(3, "Bump Tile["+ tile.letter +"]timeFraction = " + timeFraction);
            if ( timeFraction == 1 ) {
                tile.state = TileState.NONE; // we have reached our destination
                tile.animation.timeStampStart = 0; // for future instances
                game.bumpTiles(tiles, tilePositions, tile, tileSize); // do we need new animations for tiles that exist in the same location, defying the laws of science
                if (game.checkWord(tilePositions, tiles)) { game.progressToNextLevel(tiles); }            
            } 
        }
    });
    // TODO: looks like this should be refactored into a separate function
    // check if any objects need animating for GAMEANIMWON - end of level "up" animation
    animatableTiles = tiles.filter(x => x.state == TileState.GAMEANIMWON);
    animatableTiles.forEach(function(tile) {
        // this is animatable tile has it got a timeStampStart yet?
        if (tile.animation.timeStampStart == 0) {
            tile.animation.timeStampStart = timeStamp; // record the initial frame the animation starts 
            tile.animation.duration = (1 * 500); // .5 seconds
            tile.animation.fromPosition.y = parseFloat(tile.element.style.top.slice(0,-2)); // record the start position as numbers
            tile.animation.toPosition.y = 0 - (tileSize.h * 1.5);
            // calculate the distance to the toPosition, as this is the path we want to animate.
            tile.animation.toDistance.y = tile.animation.toPosition.y - tile.animation.fromPosition.y;

        } else { 
            if (timeStamp >= tile.animation.timeStampStart + tile.animation.delay) {
                // we have work to do.
                let timeFraction = (timeStamp - (tile.animation.timeStampStart + tile.animation.delay)) / tile.animation.duration; 
                if (timeFraction > 1) { 
                    timeFraction = 1; // cannot go beyond the animation end
                } 
                // timeFraction is the value between 0.0 - 1.0 that defines the progress of the animation, so 0.5 is half way.
                // Move the tile
                tile.element.style.top  = (tile.animation.fromPosition.y + (tile.animation.toDistance.y * timeFraction)) + 'px';
                if ( timeFraction == 1 ) {
                    tile.state = TileState.NONE; // we have reached our destination
                    tile.animation.timeStampStart = 0; // for future instances
                }
            } 
        }
    });
    //logger.debug(0, "length of animatable tiles "+ animatableTiles.length);
    requestAnimationFrame(game.animate);
  }
  
  // set the tiles to win mode, animates them off the screen and then initiates a new level if all animations are finished.
  // the keyframes for this animation have a hard coded value of 300% for the movement up, the tiles need to be offset via a negative margin to make this work
  game.progressToNextLevel = function(tiles) {
    for (let i=0;i<tiles.length;i++) {
        tiles[i].element.style.animation = "tile-win-animation 3s ease " + (i * 0.2) + "s forwards";
        tiles[i].animation.delay = ((i * 0.2) + (2)) * 1000;
        tiles[i].state = TileState.GAMEANIMWON;
        tiles[i].element.addEventListener('animationend', (e) => {
            tiles[i].state = TileState.GAMEWON;
            if (game.checkAllWon()) {
                logger.debug(0, "new level!");
                game.newLevel();
            }
        }); 
    }
  }

  // return true if the number of tiles marked as won is the total number of tiles.
  game.checkAllWon = function() {
    return ( (tiles.filter(x => x.state == TileState.GAMEWON)).length == tiles.length);
  }
 
  // check to see if the number of tiles in place and in the correct order are the winning word 
  // makes sure there are no holes or tiles being dragged/bumped
  // TODO::need to shark proof this
  game.checkWord = function(tilePositions, tiles) {
    if (game.getHoles(tilePositions, tiles).length > 0) { return false; }
    if ( (tiles.filter(x => x.state == TileState.NONE).length != tiles.length) ) { return false; } // make sure the Tiles aren't busy
    let matches = 0;
    tiles.sort(function(a, b){
        return a.element.style.left.slice(0,-2) - b.element.style.left.slice(0,-2); // sort smallest to largest
    });
    for (let i=0;i<tiles.length;i++) {  // TODO: refactor so that loop broken when tile found incorrect
        if (word[i] == tiles[i].letter.toLowerCase()) {
            matches++;
        }
    }
    return (matches == word.length);
  }
  
  // bump co-existing tiles to closest empties, or at least create the animations
  game.bumpTiles = function(tiles, tilePositions, masterTile, tileSize) {
    // FYI masterTile is not to be bumped as each position is a FIFO queue.
    // need an array of possible holes before being able to determine who can go where
    let holes = game.getHoles(tilePositions, tiles);
    let index = -1;
    tilePositions.forEach(function(tilePosition) {
        index++;
        let tilesAtPosition = game.tilesAtPosition(tiles, tilePosition);
        if (tilesAtPosition.length > 1) { 
            tilesAtPosition.forEach(function(tile) {
                if (tile !== masterTile){
                    // found a tile that needs animating
                    // find nearest hole
                    // set up animation towards it
                    tile.animation.duration = 2 * 200; // .2 seconds
                    tile.animation.fromPosition = {x:parseFloat(tile.element.style.left.slice(0,-2)), y:parseFloat(tile.element.style.top.slice(0,-2))}; // record the start position as numbers
                    tile.animation.toPosition = game.getClosestTilePosition(tilePositions, tile.animation.fromPosition.x, tileTop, tileSize, tile.animation.fromPosition, holes, index);
                    tile.animation.toDistance.x = tile.animation.toPosition.x - tile.animation.fromPosition.x;
                    tile.animation.toDistance.y = tile.animation.toPosition.y - tile.animation.fromPosition.y;
                    tile.state = TileState.GAMEBUMPED; // will get picked up in the next animation frame
                }
            });
        }
    });

  }

  // get all the Holes
  game.getHoles = function(tilePositions, tiles) {
    let holes = [];
    let index = -1;
    tilePositions.forEach(function(tilePosition) {
        let tilesAtPosition = game.tilesAtPosition(tiles, tilePosition);
        index++;
        if (tilesAtPosition.length == 0) {
            holes.push({'index': index, 'postion': tilePosition}); // no tiles here, its a hole!
        } 
    });
    return holes;
  }
  
  // check how many tiles at this position
  game.tilesAtPosition = function(tiles, tilePosition) {
    let tilesAtPosition = [];
    tiles.forEach(function(tile) {
      let tilesPosition = {x:parseFloat(tile.element.style.left.slice(0,-2)), y:parseFloat(tile.element.style.top.slice(0,-2))}; // get rid of all those nasty pixels(px)
      if ( (tilePosition.x == tilesPosition.x) && (tilePosition.y == tilesPosition.y) ) {
        tilesAtPosition.push(tile);
      }
    });
    return tilesAtPosition;
  }
  
  // set CSS z-index for new tile ordering
  // to be called during requestAnimationFrame
  game.orderTiles = function(tiles, topTile) {
    let tileZMax = baseTileZIndex + tiles.length;
    topTile.element.style.zIndex = tileZMax + 1; // this is magic
    tiles.sort(function(a, b){
        return b.element.style.zIndex - a.element.style.zIndex; // sort largest to smallest
    });
    let current = tileZMax;
    tiles.forEach(function(tile) {
            tile.element.style.zIndex = current;
            current--;
    });
  }
  
  // calculate the tile size based on playarea
  // returns a TileSize object
  // Allows additional checks on available space after initial calculation purely on Width
  game.calculateTileSize = function(max){
    let size = new TileSize(max, max);
    return size; // TODO base on targeDiv size
  }
  
  // calculate the maximum possible tile size based on playarea
  // returns a single integer representing the maximum number of pixels a tile can be in height(and width)
  game.calculateMaxTileSize = function(playAreaWidth, wordLength, tilePadding){
    let result = (playAreaWidth - ((wordLength + 2 + 1) * tilePadding)) / (wordLength + 2);
    return result;
  }
  
  // shuffle the letter order
  game.shuffle = function(word) {
    let shuffled = "".padStart(word.length, '_');
    for (let i = 0; i< word.length; i++) {
      let charIndx = Math.floor(Random.getRandomRange(0, word.length));
      while ((shuffled[charIndx] != '_') || ((charIndx == i) && (shuffled.match(/_/g).length != 1) )) {
        charIndx = Math.floor(Random.getRandomRange(0, word.length));
      }
      shuffled = game.replaceAt(shuffled, charIndx, word[i]);
    }
    return shuffled;
  }

  // replace character at index in a string
  game.replaceAt = function(word, index, change) {
    let asArray = word.split("");
    asArray[index] = change;
    return asArray.join("");
  }

  // attach tiles to DOM as draggable elements
  game.attachTiles = function(tiles) {
    let targetDiv = document.querySelector(game.targetDiv); // TODO: pass this in
    for (let i = 0; i<tiles.length; i++) {
      let newTile = tiles[i].create();
      tiles[i].element = newTile;
      newTile.hidden = true; // Start hidden before the "bob" animation
      document.querySelector(game.targetDiv).append(newTile); // TODO: pass this in, seriously !
      new DraggableElement(newTile, targetDiv, tiles[i]);
      setTimeout(game.tileBobUp, Random.getRandomRange(100, 1000), newTile); // random wait before launching the CSS bob animation
    }
  }

  // Bob-up tile - CSS animation
  // removes the class if required before unhiding the element and applying the class
  game.tileBobUp = function(element) {
    element.hidden = false;
    element.classList.remove('bob-up');
    element.classList.add('bob-up');
  }

  // Create all the tile objects
  game.createTiles = function(word, positions, tileSize) {
    let tileArray = [];
    for (let i = 0; i< word.length;i++) {
      let letter = word[i];
      tileArray.push(new Tile(letter.toUpperCase(), i, positions[i], tileSize, baseTileZIndex + i)); 
    }
    return tileArray;
  }
  
  // where do the Tiles sit in space?
  game.calculateTilePositions = function(word, playArea, tileWidth, tilePadding) {
    logger.debug(2, "calculateTilePositions() tileWidth = [" + tileWidth + "] tilePadding = [" + tilePadding + "]");
    let x = (playArea.width - ((tileWidth + tilePadding) * word.length)) /2;
    logger.debug(2, "calculateTilePositions() playArea.width = [" + playArea.width + "] initial x = [" + x + "]");
    let positions = [];
    positions.push(new TilePosition(Math.round(x), tileTop)); 
    for (let i = 1; i < word.length; i++) {
      x += tileWidth + tilePadding
      positions.push(new TilePosition(Math.round(x), tileTop ));
    }
    return positions;
  }
  
  // when a tile is bumped we want the direction to the nearest hole for the precesion of affected tiles to travel in
  game.getClosestHolePosition = function(tilePositions, x, tileTop, tileSize, excludePosition, holes, excludeIndex) {
      let newTileIndex = excludeIndex;
      // Step 1: find closest hole (by index)
      // to the left
      let leftClosest = -1;
      for (let i=(excludeIndex-1); i>0; i--){
          if (holes.find(x => x.index == i)) {
            leftClosest = i; 
            break;
          }
      }
      // to the right
      let rightClosest = -1;
      for (let i=(excludeIndex+1); i<tilePositions.length; i++){
          if (holes.find(x => x.index == i)) {
            rightClosest = i; 
            break;
          }
      }
      if (leftClosest == rightClosest) {
        // if both winners or both losers - random
        if (Random.getRandomRange(0, 2) == 1) {
            newTileIndex++;
        } else {
            newTileIndex--;
        }
      } else {
        if (leftClosest < 0) {
          // right wins by default
          newTileIndex++;
        } else if (rightClosest < 0) {
          // left wins by default
          newTileIndex--;
        } else {
          // the sides are contested
          if ( (excludeIndex - leftClosest) < (rightClosest - excludeIndex) ){
            newTileIndex--;
          } else {
            newTileIndex++;
          }
        }
      }
      if (newTileIndex > tilePositions.length) {
        newTileIndex -= 2;
      }
      if (newTileIndex < 0) {
        newTilePos += 2;
      }
      if (newTileIndex == excludeIndex) {
          throw "new tile Index cannot be established, don't worry, this is impossible";
      }
      return tilePositions[newTileIndex].x;
  }
  
  // Get the closest in Horizontal plane tile position
  // for animating tiles and them homing-in on the correct tile column
  // for tile bumping i.e. when a tile is already in "a" position include parameter excludePosition
  // if holes are supplied prefer them
  game.getClosestTilePosition = function(tilePositions, x, tileTop, tileSize, excludePosition, holes, bumpIndex) {
    let playArea = document.querySelector(game.targetDiv).getBoundingClientRect(); // TODO: really don't like this global
    let closest = {x:"-1000", y:tileTop}; /* record the destination position */
    if (bumpIndex) {
        closest.x = game.getClosestHolePosition(tilePositions, x, tileTop, tileSize, excludePosition, holes, bumpIndex);
        return closest;
    }
    let closestPosition = {index:-1, distance:Number.MAX_SAFE_INTEGER };
    for (let i=0; i<tilePositions.length; i++) {
      if ( (excludePosition == null) || (tilePositions[i].x != excludePosition.x) ) {
          let distance = ( Math.max(tilePositions[i].x, x) - Math.min(tilePositions[i].x, x) );
          if ( distance < closestPosition.distance ) {
            closestPosition.distance = distance;
            closestPosition.index = i;
          } 
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

// Tile State - enum equivilant
const TileState = Object.freeze({NONE:"NONE", USERDROPPED: "USERDROPPED", USERDRAGGING: "USERDRAGGING", GAMEBUMPED: "GAMEBUMPED", GAMEANIMWON: "GAMEANIMWON", GAMEWON: "GAMEWON"})

// Title class
function Tile(letter, id, pos, size, zIndex) {
  let tile = this;
  tile.letter = letter;
  tile.id = id;
  tile.pos = pos; // TODO:: can I make this a get;set; and update the style through that? because at the moment it is only used here for the inital creation
  tile.size = size;
  tile.state = TileState.NONE;
 
  // TODO:: make this reusable animation class
  tile.animation = {timeStampStart:0, duration:0, fromPosition:{x:0, y:0}, toPosition:{x:0, y:0}, toDistance:{x:0, y:0}, delay:0};
  tile.element = null;
  
  tile.create = function() {
    let element = document.createElement('div');
    element.className = "tile no-select letter-" + tile.letter +" tile-" + tile.id + "";
    element.setAttribute("style","left:" + tile.pos.x + "px;top:" + tile.pos.y + "px;width:" + tile.size.w + "px;height:" + tile.size.h + "px");
    element.style.zIndex = zIndex;
    let innerElement = document.createElement('div');
    innerElement.className = "inner";
    innerElement.innerHTML = '<svg viewBox="0 0 100 100"><text x="18" y="90%">'+ tile.letter +'</text></svg>';
    element.append(innerElement);
    return element;
  };
}

// Tile position class
function TilePosition(x, y) {
  let tilePosition = this;
  tilePosition.x = x;
  tilePosition.y = y;
}

// Tile size class
function TileSize(w, h) {
  let tileSize = this;
  tileSize.w = w;
  tileSize.h = h;
}


// Logger class
function Logger(debugLevel) {
  let logger = this;
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
// has a number of Tile specific elements making it non-generic :(
function DraggableElement(element, draggableArea, tile) {
  let draggableElement = this;
  draggableElement.element = element;
  draggableElement.draggableArea = draggableArea;
  draggableElement.offsetLeft = 0;
  draggableElement.offsetTop = 0;
  draggableElement.tile = tile; // instance of the tile that is draggable. Makes this class tile object agnostic, but required to able to get at the tile specific attrributes. 
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
    draggableElement.tile.state = TileState.NONE;
    draggableElement.element.classList.remove('bob-up');
    draggableElement.element.classList.add("selected")
    if (e.type=="mousedown") {
      draggableElement.offsetLeft = e.clientX - draggableElement.element.offsetLeft;
      draggableElement.offsetTop  = e.clientY - draggableElement.element.offsetTop;
      draggableElement.draggableArea.addEventListener("mousemove", draggableElement.dragElement, false);
    } else if(e.type=="touchstart") { 
      draggableElement.offsetLeft = e.targetTouches[0].clientX - draggableElement.element.offsetLeft;
      draggableElement.offsetTop  = e.targetTouches[0].clientY - draggableElement.element.offsetTop;
      draggableElement.draggableArea.addEventListener("touchmove", draggableElement.dragElement, false);
    }
    draggableElement.tile.state = TileState.USERDRAGGING;
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
      draggableElement.tile.state = TileState.USERDRAGGING;
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
      draggableElement.element.classList.remove("selected")
      draggableElement.element = null;
      draggableElement.tile.state = TileState.USERDROPPED; // main animation loop will identify a tile that needs to be animated to its nearest column position
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
  getRandomRange : function(min, max) {
    return min + ( max * this.getRandom());
  },
};


