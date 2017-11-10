function BrickMapper(stageDiv) {

  var stageWidth = parseInt($(stageDiv).width());
  var stageHeight = parseInt($(stageDiv).height());

  var stageLeft = 0;
  var stageRight = stageLeft + stageWidth;
  var stageTop = 0;
  var stageBottom = stageTop + stageHeight;

  var shortestSide = Math.min(stageWidth, stageHeight);
  var mouseIsDown = false;

  var drawRect = {x:0,y:0,w:0,h:0};
  var gutterX = 0;
  var gutterY = 0;
  var rowOffset = 0;

  // Setup canvas drawing
  $(stageDiv).append('<canvas id="brick-mapper-canvas"></canvas>');
  var canvas = $('#brick-mapper-canvas');
  var ctx = document.getElementById('brick-mapper-canvas').getContext('2d');
  $('#brick-mapper-canvas').attr('width', stageWidth);
  $('#brick-mapper-canvas').attr('height', stageHeight);

  $(stageDiv).append('<div id="brick-mapper-settings" style="position:fixed; background-color: rgba(255,255,255,0.2); padding: 26px; bottom:0%;"><datalist id="offset-detents"><option value="25"><option value="33.33"><option value="50"><option value="66.66"><option value="75"></datalist><form><input id="rowOffsetInput" type="range" min="0" max="100" step="0.01" value="0" /><span> Row offset: </span><span id="rowOffset">0</span><br/><input id="gutterXInput" type="range" min="0" max="30" step="0.1" value="0" /><span> Gutter X: </span><span id="gutter-x">0</span><br/><input id="gutterYInput" type="range" min="0" max="30" step="0.1" value="0" /><span> Gutter Y: </span><span id="gutter-y">0</span></form></div>');

  this.enable = function() {

    $(canvas)[0].addEventListener('mousedown', mousedown, false);
    $(canvas)[0].addEventListener('mousemove', mousemove, false);
    $(canvas)[0].addEventListener('mouseup', mouseup, false);

    $('#rowOffsetInput')[0].oninput = function(evt) {
      document.getElementById('rowOffset').innerHTML = evt.target.value + '%';
      rowOffset = parseFloat(evt.target.value) * 0.01;
      drawBrickPattern(drawRect);
    };

    $('#gutterXInput')[0].oninput = function(evt) {
      document.getElementById('gutter-x').innerHTML = evt.target.value;
      gutterX = parseFloat(evt.target.value);
      drawBrickPattern(drawRect);
    };

    $('#gutterYInput')[0].oninput = function(evt) {
      document.getElementById('gutter-y').innerHTML = evt.target.value;
      gutterY = parseFloat(evt.target.value);
      drawBrickPattern(drawRect);
    };

    $('#rowOffsetInput')[0].onchange = changeComplete;
    $('#gutterXInput')[0].onchange = changeComplete;
    $('#gutterYInput')[0].onchange = changeComplete;

  };

  this.disable = function() {

    $(canvas)[0].removeEventListener('mousedown', mousedown, false);
    $(canvas)[0].removeEventListener('mousemove', mousemove, false);
    $(canvas)[0].removeEventListener('mouseup', mouseup, false);

    // TODO remove slider listeners

  };

  function mousedown(event) {

    mouseIsDown = true;
    inputStart(event.pageX, event.pageY);

  }

  function mousemove(event) {

    if (mouseIsDown === true) {
      inputMove(event.pageX, event.pageY);
    }

  }

  function mouseup(event) {

    mouseIsDown = false;
    inputUp();

  }

  function inputStart(inputX, inputY) {

    drawRect.x = drawRect.w = inputX;
    drawRect.y = drawRect.h = inputY;
    clearCanvas();

  }

  function inputMove(inputX, inputY) {

    // Draw rect
    drawRect.w = inputX - drawRect.x;
    drawRect.h = inputY - drawRect.y;

    // Draw UI
    drawMasterRect(drawRect);

  }

  function inputUp() {

    // clearCanvas();

  }

  function changeComplete() {
    console.log('Save values and redraw grid.');
    drawBrickPattern(drawRect);
  }

  // Canvas drawing
  function drawMasterRect(drawRect) {

    clearCanvas();

    // Currently drawn rect.
    ctx.rect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    // Ring around origin
    ctx.beginPath();
    ctx.arc(drawRect.x, drawRect.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.fill();
    ctx.stroke();

  }

  // Calculate and redraw brick pattern.
  function drawBrickPattern(mainRect) {

    if (mainRect.w == 0 || mainRect.h == 0) return;

    clearCanvas();
    drawMasterRect(mainRect);

    // Using current variables, draw bricks
    // in every direction until outside bounds.
    let iX = mainRect.x;
    let iY = mainRect.y;

    const pixelRowOffset = rowOffset * (1 * (mainRect.w + gutterX));

    // Create "this" row
    tileRow({x:iX, y:iY, w:mainRect.w, h:mainRect.h});

    // Create tile rows, going upward..
    while (iY > stageTop - mainRect.h) {

      // Move one tile up
      iY -= mainRect.h;

      // Add gutter
      iY -= gutterY;

      // Offset row's X position
      iX += pixelRowOffset;

      tileRow({x:iX, y:iY, w:mainRect.w, h:mainRect.h});

    }

    // Create tile rows, going downward..
    iY = mainRect.y;
    iX = mainRect.x;
    while (iY < stageBottom + mainRect.h) {

      // Move one tile up
      iY += mainRect.h;

      // Add gutter
      iY += gutterY;

      // Offset row's X position
      iX -= pixelRowOffset;

      tileRow({x:iX, y:iY, w:mainRect.w, h:mainRect.h});

    }

  }

  function tileRow(guideRect) {

    let iX = guideRect.x;
    let iY = guideRect.y;
    let tileRect = {x:guideRect.x, y:guideRect.y, w:guideRect.w, h:guideRect.h};

    // From drawRect, tile left...
    while (iX > stageLeft - guideRect.w) {

      // Move one tile over
      iX -= guideRect.w;

      // Add gutter
      iX -= gutterX;

      tileRect = {x:iX, y:iY, w:guideRect.w, h:guideRect.h};
      drawSingleTile(tileRect);

    }

    // From drawRect, tile right...
    iX = guideRect.x;

    while (iX < stageRight + guideRect.w) {

      // Move one tile over
      iX += guideRect.w;

      // Add gutter
      iX += gutterX;

      tileRect = {x:iX, y:iY, w:guideRect.w, h:guideRect.h};
      drawSingleTile(tileRect);

    }

  }

  function drawSingleTile(rect) {

    // Currently drawn rect.
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(100,100,255,0.6)';
    ctx.fill();

    // Draw cross strokes
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.moveTo(rect.x + rect.w, rect.y);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.stroke();

  }

  function clearCanvas() {

    ctx.clearRect(0, 0, stageWidth, stageHeight);

  }

  function map(value, low1, high1, low2, high2) {

    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);

  }

};
