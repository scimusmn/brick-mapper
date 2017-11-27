function BrickMapper(stageDiv) {

  var stageWidth = parseInt($(stageDiv).width());
  var stageHeight = parseInt($(stageDiv).height());

  var stageLeft = 0;
  var stageRight = stageLeft + stageWidth;
  var stageTop = 0;
  var stageBottom = stageTop + stageHeight;

  var shortestSide = Math.min(stageWidth, stageHeight);
  var mouseIsDown = false;

  var brickWidth = 0;
  var brickHeight = 0;
  var intervalX = 0;
  var intervalY = 0;
  var rowOffset = 0;

  var colorFlip = -1;

  var SAVE_KEY = 'brick-mapper-ls';

  var brickPoints = [];
  var calcPoints = [];

  // Setup canvas drawing
  $(stageDiv).append('<canvas id="brick-mapper-canvas"></canvas>');
  var canvas = $('#brick-mapper-canvas');
  var ctx = document.getElementById('brick-mapper-canvas').getContext('2d');
  $('#brick-mapper-canvas').attr('width', stageWidth);
  $('#brick-mapper-canvas').attr('height', stageHeight);

  $(stageDiv).append('<div id="brick-mapper-settings" style="position:fixed; background-color: rgba(255,255,255,0.2); padding: 26px; bottom:0%;"><span id="savebtn">save</span>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span id="calcbtn">calc</span><br/><br/><datalist id="offset-detents"><option value="25"><option value="33.33"><option value="50"><option value="66.66"><option value="75"></datalist><form><input id="rowOffsetInput" type="range" min="0" max="100" step="0.01" value="0" /><span> Row offset: </span><span id="rowOffset">0</span><br/><input id="brickWidth" type="range" min="5" max="100" step="0.1" value="0" /><span> Brick Width: </span><span id="brickWidthVal">0</span><br/><input id="brickHeight" type="range" min="5" max="100" step="0.1" value="0" /><span> Brick Height: </span><span id="brickHeightVal">0</span></form></div>');

  var settings = $('#brick-mapper-settings');

  this.enable = function() {

    $(canvas).show();
    $(settings).show();

    $(canvas)[0].addEventListener('mousedown', mousedown, false);
    $(canvas)[0].addEventListener('mousemove', mousemove, false);
    $(canvas)[0].addEventListener('mouseup', mouseup, false);

    $('#rowOffsetInput')[0].oninput = function(evt) {

      document.getElementById('rowOffset').innerHTML = evt.target.value + '%';
      rowOffset = parseFloat(evt.target.value) * 0.01;
      console.log('row', rowOffset);
      drawUI();

    };

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

    $('#savebtn').click(() => {

      console.log('Save btn clicked');

    });

    $('#calcbtn').click(() => {

      console.log('Calc btn clicked');

      // We assume the coordinates
      // of the first and last
      // brick are perfect, then find
      // the right intervals by averaging
      // the rest of the brick points.

      calcPoints = [];

      var first = brickPoints[0];
      var last = brickPoints[brickPoints.length - 1];

      intervalX = (last.x - first.x) / (brickPoints.length - 1);
      intervalY = (last.y - first.y) / (brickPoints.length - 1);

      for (var i = 0; i < brickPoints.length; i++) {

        var bp = brickPoints[i];
        var cx = first.x + (intervalX * i);
        var cy = first.y + (intervalY * i);

        calcPoints.push({x:cx, y:cy});

      }

      console.log(intervalX, intervalY);
      console.log(calcPoints);

      drawUI(0, 0);

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

  function save() {
    // TODO - save layout.
    // overwrite previous data.
    const saveObj = {

    };

    localStorage.setItem(SAVE_KEY, saveObj);

  }

  function mousedown(event) {

    mouseIsDown = true;
    inputStart(event.pageX, event.pageY);

  }

  function mousemove(event) {

    drawUI(event.pageX, event.pageY);

  }

  function mouseup(event) {

    mouseIsDown = false;
    inputUp();

  }

  function inputStart(inputX, inputY) {

    addBrickPoint(inputX, inputY);

  }

  function inputMove(inputX, inputY) {

  }

  function inputUp() {

  }

  function changeComplete() {
    console.log('Save values and redraw grid.');
    drawBrickPattern();
  }

  // Add brick
  function addBrickPoint(x,y) {

    brickPoints.push({x:x,y:y});

    drawUI(x, y);

  }

  function drawUI(mouseX, mouseY) {

    clearCanvas();

    drawBrickPattern();

    // Red crosshairs for easy cursor tracking
    ctx.beginPath();
    ctx.strokeStyle = '#FD3E43';
    ctx.moveTo(0, mouseY);
    ctx.lineTo(stageWidth, mouseY);
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, stageHeight);
    ctx.stroke();

    for (var i = 0; i < brickPoints.length; i++) {
      var bp = brickPoints[i];

      // Draw all brick points
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';
      ctx.fill();
      ctx.stroke();

    }

    for (var i = 0; i < calcPoints.length; i++) {
      var cp = calcPoints[i];

      // Draw all calculated points
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFC55';
      ctx.strokeStyle = '#FFFC55';
      ctx.fill();
      ctx.stroke();

      // Draw connection to origin
      ctx.beginPath();
      ctx.strokeStyle = 'gray';
      ctx.moveTo(cp.x, cp.y);
      ctx.lineTo(brickPoints[i].x, brickPoints[i].y);
      ctx.stroke();

    }

  }

  // Calculate and redraw brick pattern.
  function drawBrickPattern() {

    if (brickWidth == 0 || brickHeight == 0 || calcPoints.length < 3) return;

    for (var i = 0; i < calcPoints.length; i++) {

      var cp = calcPoints[i];
      var bRect = {x:cp.x - (brickWidth / 2), y:cp.y - (brickHeight / 2), w:brickWidth, h:brickHeight};
      drawSingleTile(bRect, true);

      // Finish row this tile occupies
      tileRow(bRect);

    }

    // TEMP
    return;


  }

  function tileRow(guideRect) {

    let iX = guideRect.x;
    let iY = guideRect.y;
    let tileRect = {x:guideRect.x, y:guideRect.y, w:guideRect.w, h:guideRect.h};

    // From guideRect, tile left...
    while (iX > stageLeft - guideRect.w) {

      // Move one tile over
      iX -= guideRect.w;

      tileRect = {x:iX, y:iY, w:guideRect.w, h:guideRect.h};
      drawSingleTile(tileRect);

    }

    // From guideRect, tile right...
    iX = guideRect.x;

    while (iX < stageRight + guideRect.w) {

      // Move one tile over
      iX += guideRect.w;

      tileRect = {x:iX, y:iY, w:guideRect.w, h:guideRect.h};
      drawSingleTile(tileRect);

    }

  }

  function drawSingleTile(rect, highlight) {

    var highlight = highlight | false;

    // Currently drawn rect.
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = '#31A08B';

    if (highlight == true) {
      ctx.fillStyle = '#FD3E43';
    }

    ctx.fill();

    // Draw cross strokes
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.moveTo(rect.x + rect.w, rect.y);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.stroke();
    ctx.closePath();

  }

  function clearCanvas() {

    ctx.clearRect(0, 0, stageWidth, stageHeight);

  }

  function map(value, low1, high1, low2, high2) {

    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);

  }

};
