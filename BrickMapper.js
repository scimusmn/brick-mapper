function BrickMapper(stageDiv) {

  var stageWidth = parseInt($(stageDiv).width());
  var stageHeight = parseInt($(stageDiv).height());

  var stageLeft = 0;
  var stageRight = stageLeft + stageWidth;
  var stageTop = 0;
  var stageBottom = stageTop + stageHeight;

  var shortestSide = Math.min(stageWidth, stageHeight);
  var mouseIsDown = false;

  var brickWidth = 2;
  var brickHeight = 2;
  var intervalX = 0;
  var intervalY = 0;
  var rowOffset = 0;

  var SAVE_KEY = 'brick-mapper-ls';

  var horizontalStart = null;
  var horizontalEnd = null;
  var horizontalNumPts = 2;

  var diagonalStart = null;
  var diagonalEnd = null;
  var diagonalNumPts = 2;

  var brickPoints = [];

  var allBricks = [];
  var boundsBricks = {};

  var shiftHeld = false;

  // Setup canvas drawing
  $(stageDiv).append('<canvas id="brick-mapper-canvas"></canvas>');
  var canvas = $('#brick-mapper-canvas');
  var ctx = document.getElementById('brick-mapper-canvas').getContext('2d');
  $('#brick-mapper-canvas').attr('width', stageWidth);
  $('#brick-mapper-canvas').attr('height', stageHeight);

  $(stageDiv).append('<div id="brick-mapper-settings" style="position:fixed; background-color: rgba(5,5,5,0.8); color: rgba(255,255,255,0.8); padding: 26px; bottom:0%;"><span id="savebtn">SAVE&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span><span id="lockbtn" class="edit-mode">LOCK</span><br/><br/><input id="horizontalCount" type="range" min="2" max="100" step="1" value="2" /><span> Horizontal Count: </span><span id="horizontalCountVal">2</span><br/><input id="diagonalCount" type="range" min="2" max="100" step="1" value="2" /><span> Diagonal Count: </span><span id="diagonalCountVal">2</span><br/><input id="brickWidth" type="range" min="1" max="70" step="0.1" value="1" /><span> Brick Width: </span><span id="brickWidthVal">0</span><br/><input id="brickHeight" type="range" min="1" max="70" step="0.1" value="1" /><span> Brick Height: </span><span id="brickHeightVal">0</span></form></div>');

  var settings = $('#brick-mapper-settings');

  this.enable = function() {

    $(canvas).show();
    $(settings).show();

    $(canvas)[0].addEventListener('mousedown', mousedown, false);
    $(canvas)[0].addEventListener('mousemove', mousemove, false);
    $(canvas)[0].addEventListener('mouseup', mouseup, false);

    // Watch when shift is held.
    $(document).on('keyup keydown', function(evt) {

      shiftHeld = evt.shiftKey;

    });

    $('#brickWidth')[0].oninput = function(evt) {
      document.getElementById('brickWidthVal').innerHTML = evt.target.value;
      brickWidth = parseFloat(evt.target.value);
      drawUI();
    };

    $('#brickHeight')[0].oninput = function(evt) {
      document.getElementById('brickHeightVal').innerHTML = evt.target.value;
      brickHeight = parseFloat(evt.target.value);
      drawUI();
    };

    $('#horizontalCount')[0].oninput = function(evt) {
      document.getElementById('horizontalCountVal').innerHTML = evt.target.value;
      horizontalNumPts = parseInt(evt.target.value);
      drawUI();
      updateIntervals();
    };

    $('#diagonalCount')[0].oninput = function(evt) {
      document.getElementById('diagonalCountVal').innerHTML = evt.target.value;
      diagonalNumPts = parseInt(evt.target.value);
      drawUI();
      updateIntervals();
    };

    $('#savebtn').click(() => {

      save();

    });

    $('#lockbtn').click(() => {

      console.log('Lock btn clicked');

      if ($('#lockbtn').text() == 'LOCK') {

        $('#lockbtn').text('UNLOCK');

        // Hide all settings
        $('#brick-mapper-settings').children().not('.edit-mode').hide();

        // Unlock for mapping mode

      } else {

        $('#lockbtn').text('LOCK');

        // Show all settings
        $('#brick-mapper-settings').children().not('.edit-mode').show();

        // Lock down mapping for brick editor
      }

    });

    $('#brickWidth')[0].onchange = changeComplete;
    $('#brickHeight')[0].onchange = changeComplete;

  };

  this.disable = function() {

    // $(canvas)[0].removeEventListener('mousedown', mousedown, false);
    // $(canvas)[0].removeEventListener('mousemove', mousemove, false);
    // $(canvas)[0].removeEventListener('mouseup', mouseup, false);

    $(canvas).hide();
    $(settings).hide();

  };

  this.getAllBricks = function() {

    return allBricks;

  };

  this.getBoundingBricks = function() {

    var bounds = {};

  };

  this.getBrickSize = function() {

    return {w:brickWidth, h:brickHeight};

  };

  this.load = function() {

    var loadObj = JSON.parse(localStorage.getItem(SAVE_KEY));

    // for (var i = 0; i < localStorage.length; i++) {
    //   var key = localStorage.key(i);
    //   var item = JSON.parse(localStorage.getItem(key));
    //   loadedData[key] = item;
    // }

    brickWidth = loadObj.brickWidth;
    brickHeight = loadObj.brickHeight;
    intervalX = loadObj.intervalX;
    intervalY = loadObj.intervalY;
    rowOffset = loadObj.rowOffset;

    console.log('loadObj', loadObj);

  };

  function save() {

    console.log('save');

    const saveObj = {

      brickWidth: brickWidth,
      brickHeight: brickHeight,
      intervalX: intervalX,
      intervalY: intervalY,
      rowOffset: rowOffset,
      allBricks: allBricks,

    };

    console.log('==== ALL BRICKS ====');
    console.log(allBricks);
    console.log('==== END BRICKS ====');

    // console.log(boundsBricks);

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj));

    drawBoundsBricks();

  }

  function mousedown(event) {

    mouseIsDown = true;
    inputStart(event.pageX, event.pageY);

  }

  function mousemove(event) {

    inputMove(event.pageX, event.pageY);

  }

  function mouseup(event) {

    mouseIsDown = false;
    inputUp(event.pageX, event.pageY);

  }

  function inputStart(inputX, inputY) {

    if (shiftHeld) {
      horizontalStart = {x:inputX, y:inputY};
    } else {
      diagonalStart = {x:inputX, y:inputY};
    }

    drawUI(inputX, inputY);

  }

  function inputMove(inputX, inputY) {

    if (mouseIsDown) {
      console.log('inputMove', shiftHeld);

      if (shiftHeld) {
        horizontalEnd = {x:inputX, y:inputY};
      } else {
        diagonalEnd = {x:inputX, y:inputY};
      }

    }

    drawUI(inputX, inputY);

  }

  function inputUp(inputX, inputY) {

    if (shiftHeld) {
      horizontalEnd = {x:inputX, y:inputY};
    } else {
      diagonalEnd = {x:inputX, y:inputY};
    }

    updateIntervals();

  }

  function updateIntervals() {

    if (horizontalEnd) {

      var pixelWidth = horizontalEnd.x - horizontalStart.x;
      intervalX = pixelWidth / (horizontalNumPts - 1);

      console.log('horizontal interval x', intervalX);

      updateGuideBrickPoints();

    }

    if (diagonalEnd) {

      var pixelHeight = diagonalEnd.y - diagonalStart.y;
      var pixelWidth = diagonalEnd.x - diagonalStart.x;

      intervalY = pixelHeight / (diagonalNumPts - 1);
      rowOffset = pixelWidth / (diagonalNumPts - 1);

      console.log('diagonal interval y', intervalY);
      console.log('diagonal rowOffset', rowOffset);

    }

  }

  function updateGuideBrickPoints() {

    var avgY = (horizontalStart.y + horizontalEnd.y) / 2;
    var px = horizontalStart.x;
    brickPoints = [];

    for (var i = 0; i < horizontalNumPts; i++) {

      pt = avgY;

      brickPoints.push({x:px, y:avgY});

      px += intervalX;

    }

  }

  function changeComplete() {

    console.log('Save values and redraw grid.');

  }

  // Add brick
  function addBrickPoint(x,y) {

    drawUI(x, y);

  }

  function drawUI(mouseX, mouseY) {

    clearCanvas();

    allBricks = [];
    boundsBricks = {top:[],bottom:[],right:[],left:[]};

    // Red crosshairs for easy cursor tracking
    ctx.beginPath();
    ctx.strokeStyle = '#FD3E43';
    ctx.moveTo(0, mouseY);
    ctx.lineTo(stageWidth, mouseY);
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, stageHeight);
    ctx.stroke();

    // Draw horizontal guide line
    if (horizontalStart) {

      circle(horizontalStart.x, horizontalStart.y);
      line(horizontalStart.x, horizontalStart.y - 20, horizontalStart.x, horizontalStart.y + 20, 'white');
      line(horizontalStart.x - 20, horizontalStart.y, horizontalStart.x + 20, horizontalStart.y, 'white');

      if (horizontalEnd) {

        line(horizontalStart.x, horizontalStart.y, horizontalEnd.x, horizontalEnd.y, 'yellow');
        circle(horizontalEnd.x, horizontalEnd.y);
        line(horizontalEnd.x, horizontalEnd.y - 20, horizontalEnd.x, horizontalEnd.y + 20, 'white');
        line(horizontalEnd.x  - 20, horizontalEnd.y, horizontalEnd.x + 20, horizontalEnd.y, 'white');

      }

      // Draw ticks along line
      // to represent brick centers...
      if (!mouseIsDown) {

        drawSegmentsOverLine(horizontalStart, horizontalEnd, horizontalNumPts);

      }

    }

    // Draw diagonal guide line
    if (diagonalStart) {

      circle(diagonalStart.x, diagonalStart.y);
      line(diagonalStart.x  - 20, diagonalStart.y, diagonalStart.x + 20, diagonalStart.y, 'white');
      line(diagonalStart.x, diagonalStart.y  - 20, diagonalStart.x, diagonalStart.y + 20, 'white');

      if (diagonalEnd) {

        line(diagonalStart.x, diagonalStart.y, diagonalEnd.x, diagonalEnd.y, '#44ffaa');
        circle(diagonalEnd.x, diagonalEnd.y);
        line(diagonalEnd.x, diagonalEnd.y - 20, diagonalEnd.x, diagonalEnd.y + 20, 'white');
        line(diagonalEnd.x - 20, diagonalEnd.y, diagonalEnd.x  + 20, diagonalEnd.y, 'white');

      }

      // Draw ticks along line
      // to represent brick centers...
      if (!mouseIsDown) {

        drawSegmentsOverLine(diagonalStart, diagonalEnd, diagonalNumPts);

      }

    }

    // When horizontal and diagonal have been
    // drawn, extrapolate to all bricks
    if (!mouseIsDown && diagonalNumPts > 2 && horizontalNumPts > 2) {

      // Draw the guide brick row...
      for (var i = 0; i < brickPoints.length; i++) {

        var bp = brickPoints[i];

        // Draw all brick points
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
        ctx.fill();
        ctx.stroke();

      }

      // Starting from first brick,
      // extrapolate to all brick center pts

      var rowY = brickPoints[0].y;
      var rowX = brickPoints[0].x;

      let last = {x:rowX, y:rowY};

      // Draw guide row
      tileRow(rowX, rowY);

      // Create rows going upward
      while (rowY > stageTop + brickHeight) {

        // Move one tile up
        rowY -= intervalY;
        rowX -= rowOffset;

        // Draw row
        last = tileRow(rowX, rowY);

      }

      boundsBricks.top = last;

      rowY = brickPoints[0].y;
      rowX = brickPoints[0].x;

      // Create rows going downward
      while (rowY < stageBottom - brickHeight) {

        // Move one tile up
        rowY += intervalY;
        rowX += rowOffset;

        // Draw row
        last = tileRow(rowX, rowY);

      }

      boundsBricks.bottom = last;

    }

  }

  // Calculate and redraw brick pattern.
  function drawSegmentsOverLine(start, end, totalPts) {

    var percIncrement = 1 / (totalPts - 1);
    var drawPerc = 0;
    var pt;
    for (var i = 0; i < totalPts; i++) {
      drawPerc = percIncrement * i;
      pt = midpoint(start.x, start.y, end.x, end.y, drawPerc);
      circle(pt.x, pt.y);
    }

  }

  function tileRow(baseX, baseY) {

    // Firstly, if base brick is offscreen,
    // iterate until onscreen.
    while ((baseX + (brickWidth / 2)) < stageLeft) {
      baseX += intervalX;
    }

    while ((baseX - (brickWidth / 2)) > stageRight) {
      baseX -= intervalX;
    }

    let rowArray = [];
    let iX = baseX;
    let iY = baseY;
    let counter = 1;

    let leftmostBrick = {x:999999};
    let rightmostBrick = {x:-999999};

    // Check for bounds bricks
    if (iX < leftmostBrick.x) {
      leftmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
    }

    if (iX > rightmostBrick.x) {
      rightmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
    }

    // First, this tile
    // (commented out because uneccessary)
    // rowArray.push(drawSingleTile(iX, iY, isOdd(counter)));

    // From guideRect, tile left...
    while ((iX + (brickWidth / 2)) > stageLeft) {

      rowArray.push(drawSingleTile(iX, iY, isOdd(counter)));

      // Check for bounds bricks
      if (iX < leftmostBrick.x) {
        leftmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
      }

      if (iX > rightmostBrick.x) {
        rightmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
      }

      // Move one tile over
      iX -= intervalX;

      counter++;

    }

    // From guideRect, tile right...
    iX = baseX + intervalX;
    counter = 0;

    while ((iX - (brickWidth / 2)) < stageRight) {

      rowArray.push(drawSingleTile(iX, iY, isOdd(counter)));

      // Check for bounds bricks
      if (iX < leftmostBrick.x) {
        leftmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
      }

      if (iX > rightmostBrick.x) {
        rightmostBrick = {x:iX, y:iY, w:brickWidth, h:brickHeight};
      }

      // Move one tile over
      iX += intervalX;

      counter++;

    }

    boundsBricks.left.push(leftmostBrick);
    boundsBricks.right.push(rightmostBrick);

    return rowArray;

  }

  function isOdd(n) {
    return Math.abs(n % 2) == 1;
  }

  function circle(x,y,r,c) {
    var radius = r || 3;
    var clr = c || 'white';
    ctx.beginPath();
    ctx.fillStyle = clr;
    ctx.strokeStyle = clr;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  function line(x1,y1,x2,y2,c) {
    var clr = c || 'white';
    ctx.beginPath();
    ctx.strokeStyle = clr;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  function midpoint(lat1, long1, lat2, long2, per) {
    return {x:(lat1 + (lat2 - lat1) * per), y:(long1 + (long2 - long1) * per)};
  }

  function drawBoundsBricks() {
    clearCanvas();
    console.log('--- drawBoundsBricks ---');
    console.log('-- top', boundsBricks.top.length);
    for (var i = 0; i < boundsBricks.top.length; i++) {
      var b = boundsBricks.top[i];
      drawSingleTile(b.x, b.y);
      console.log(b.x, b.y);
    }

    console.log('-- right', boundsBricks.right.length);
    for (var i = 0; i < boundsBricks.right.length; i++) {
      var b = boundsBricks.right[i];
      drawSingleTile(b.x, b.y);
      console.log(b.x, b.y);
    }

    console.log('-- bottom', boundsBricks.bottom.length);
    for (var i = 0; i < boundsBricks.bottom.length; i++) {
      var b = boundsBricks.bottom[i];
      drawSingleTile(b.x, b.y);
      console.log(b.x, b.y);
    }

    console.log('-- left', boundsBricks.left.length);
    for (var i = 0; i < boundsBricks.left.length; i++) {
      var b = boundsBricks.left[i];
      drawSingleTile(b.x, b.y);
      console.log(b.x, b.y);
    }

    console.log('--- end drawBoundsBricks ---');
  }

  function drawSingleTile(x, y, highlight) {

    var highlight = highlight | false;

    var r1x = x - (brickWidth / 2);
    var r1y = y - (brickHeight / 2);
    var r2x = x + (brickWidth / 2);
    var r2y = y + (brickHeight / 2);

    // Currently drawn rect.
    ctx.beginPath();
    ctx.rect(r1x, r1y, brickWidth, brickHeight);
    ctx.fillStyle = 'rgba(123,255,255,0.4)';

    if (highlight == true) {
      ctx.fillStyle = 'rgba(255,255,255,0.0)';
    }

    ctx.strokeStyle = 'rgba(123,255,255,0.9)';

    ctx.fill();
    ctx.stroke();

    // Draw cross strokes
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(r1x, r1y);
    ctx.lineTo(r2x, r2y);
    ctx.moveTo(r1x, r2y);
    ctx.lineTo(r2x, r1y);
    ctx.stroke();
    ctx.closePath();

    var clr = 'rgba(255,255,255,0.0)';
    if (highlight) {
      clr = '#FD6E83';
    }

    circle(x, y, 2, clr);

    var drawnBrick = {x:x,y:y,w:brickWidth,h:brickHeight};

    allBricks.push(drawnBrick);

    return drawnBrick;

  }

  function clearCanvas() {

    ctx.clearRect(0, 0, stageWidth, stageHeight);

  }

  function map(value, low1, high1, low2, high2) {

    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);

  }

};
