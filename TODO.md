#This is the TODO list for Anagram Shark Attack JS-E

GitHub repo and Push [X]

Html: placeholder created [X]
  Decide; elements in HTML, dynamic elements in document, dynamic elements in container 

Code: placeholder created
  Title screen [ ]
  Game over animation [ ]

CSS: placholder created
  Handles ALL sizing requirements

###Assets/components:
  Waves [X]
  Letter Tile template [X] 
  Clouds [X]
  Title [ ]
  Sonar [X]
  Radar sharks [X]
  Sharks [X]
  Game Over mouth [ ]
  Word lists [X]
  Instructions [ ]
     
Create GitHub project .io page [X]
https://robgithub.github.io/AnagramSharkAttackJS-E/

Need to define a base play area - will be more fluid later form resizing.
21:9
16:9 1080p - x1080
4:3 
1024x768 800x600

Do not fear planning - build defences to entropy

We have the game areas and base sizes.
Concentrating on the tiles;
  tiles MUST be square and must fit horizontally
  test setting the tile width by CSS percentage and then change the height to match in pixels
  - must be able to measure pixel width when set from percentage.
  - element.getBoundingClientRect().width returns the value in pixels even if oringally specified in percentages
  - element.setAttribute("style", element.getAttribute("style") + "--new style--") preserves current style
  tile location can be calculated with the current code once size has been determined.
  tile size is all about width of the play area and the number of letters.
  Max letters in words is 10
  for a word of 4 letters ABCD the word should take up the center with a border to the edge of the play area.
  - +ABCD+ the width of each letter and its required spacing must be derived from the width of the play area.
  - if the playarea is 100 then for a four letter word the width a single tile must be as six tiles, where the extra 2 are the edge spacings.
  - there will be a maximum width to avoid super massive tiles, in these cases edge spacings will compensate.
  - ignore the edge spacing and just calculate the width then add in the spacing
  - total / n = total amount of space and single tile can occupy. This can be augmented with spacing.
   - but what is total and how much spacing should be given?
   - if total is 100 and n is 4 then tile size is 25, spacing between tiles should be percentatge of tile width
   - if max tile size is 10 then spacing is total - (10 * 4) and then halfed for each edge
   - spacing should be a percentage of width per tile. 10% at initial testing
   - Create tiles with 10% padding - how does this work when Width is unknown until spacing taken into account?
   - Do not take spacing into account, just calculate the tile width based on the game play area and then add spacing.
   - n tiles, play area width, maximum size (as a percentage) = tile width and then tile spacing/padding as a 10% on each side.
   - 4 tiles, play area 600, maximum size(ignore) = 600 / 4+2 = 100, tile width is 80 with 10 spacing on each side.
   - spacing must be a product of tile size within a play area, so a play area has the same size tiles for n tiles, where n is any value between 4 and 10
  Calcuate width with no restriction, if result is greater than Max (based on height) the width is Max
   - now calculate spacing as a percentage and apply 

##Game play:
  Start button [ ]
  Word selection per level [X]
  calculate letter positions [X]
  animate titles to start locations [ ] - "Bob up CSS vertical animation"
  tiles draggable [ ]
  tile release -> closest column [ ]
  tile bumping [ ]
  timer for sharks [ ]
  animation for blips [ ]
  shark tile attack [ ]
  tile return [ ]
  completion [ ]
  death [ ]
  timer [ ]
  new level [ ]
  level indicator [ ]

##Post launch ideas.

Sharks drop from the sky
Sharks do parabolic leaps from the edges
Switch sharks for dolphins
Switch sharks for tentacles
Switch waves for rolling hills
Switch sharks for land based animal
Switch sharks for grabbing hand
Switch sharks for Unicorns
Switch waves for dessert - sweets


##Current issues

[X]tiles get stuck in repeatedly unsettled state.
  more apparent on later levels with more tiles.
  [X] what logic is in place currently
    could it be the edge is reached and seen as the closest?
    there are two possible requirements
        bump - which wasn't 100% due to odd rounding issues
        and - drop - which was working 100% and then I broke it :D
  [X] where does this logic break down
  [X] fix :D

[x]Fix new sized playarea 4 - tiles are not bumping
  - Was a percentage presision thing, stopped constantly recalculating
  
[ ]Add the clouds
  [x]for each container
  [x]fit to containers
    100% 500px 0 0 100 100
    either need to nest and animated the internal or instigate a clipping plane
    .svgs can be loaded via <img src="my.svg"> or xhr
    svgs are loaded with the viewboxes defined in their files.
    [x] load svg into div
    [x] change viewbox via script
    [x] change viewport via script
  [x] x3 clouds
    
[ ]Add the waves
[ ]Add the radar
[ ]Add the sharks
[ ]Add game over 
[ ]Add title screen

[ ]Loader for svgs "digging, filling, adding sharks ...."
[ ]check the perspective value in the game.css and how it changes with the different play area sizes


tweaks
cloud stroke size
[x]cloud random starts and durations









  
  
  
  
  

