var slide = require('./slide');
var getStyle = require('./poly')._getStyle;
var _height = require('./poly')._height;
var lowestDelta;

function shouldAdjustOldDeltas(orgEvent, absDelta)
{
  // If this is an older event and the delta is divisable by 120,
  // then we are assuming that the browser is treating this as an
  // older mouse wheel event and that we should divide the deltas
  // by 40 to try and get a more usable deltaFactor.
  // Side note, this actually impacts the reported scroll distance
  // in older browsers and can cause scrolling to be slower than native.
  // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
  return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
}

function mouseWheelHandler(e, options)
{
  var orgEvent = e || window.event;
  orgEvent.preventDefault();
  var delta      = 0;
  var deltaX     = 0;
  var deltaY     = 0;
  var absDelta   = 0;

  // Old school scrollwheel delta
  if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
  if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
  if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
  if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

  // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
  if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
    deltaX = deltaY * -1;
    deltaY = 0;
  }

  // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
  delta = deltaY === 0 ? deltaX : deltaY;

  // New school wheel delta (wheel event)
  if ( 'deltaY' in orgEvent ) {
    deltaY = orgEvent.deltaY * -1;
    delta  = deltaY;
  }
  if ( 'deltaX' in orgEvent ) {
    deltaX = orgEvent.deltaX;
    if ( deltaY === 0 ) { delta  = deltaX * -1; }
  }

  // No change actually happened, no reason to go any further
  if ( deltaY === 0 && deltaX === 0 ) { return; }

  // Need to convert lines and pages to pixels if we aren't already in pixels
  // There are three delta modes:
  //   * deltaMode 0 is by pixels, nothing to do
  //   * deltaMode 1 is by lines
  //   * deltaMode 2 is by pages
  if (orgEvent.deltaMode === 1) {
    var lineHeight = this.mousewheelLineHeight;
    delta  *= lineHeight;
    deltaY *= lineHeight;
    deltaX *= lineHeight;
  }
  else if ( orgEvent.deltaMode === 2 ) {
    var pageHeight = this.mousewheelPageHeight;
    delta  *= pageHeight;
    deltaY *= pageHeight;
    deltaX *= pageHeight;
  }

  // Store lowest absolute delta to normalize the delta values
  absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

  if ( !lowestDelta || absDelta < lowestDelta ) {
    lowestDelta = absDelta;

    // Adjust older deltas if necessary
    if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
        lowestDelta /= 40;
    }
  }

  // Adjust older deltas if necessary
  if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
  // Divide all the things by 40!
    delta  /= 40;
    deltaX /= 40;
    deltaY /= 40;
  }

  // Get a whole, normalized value for the deltas
  delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
  deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
  deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

  options.offset += deltaX;
  slide(options);
}

var toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];

function bindMouseWheel(options)
{
  function handler(e)
  {
    mouseWheelHandler(e, options);
  }
  for (var i = toBind.length; i;) {
    i -= 1;
    options.wrap.addEventListener(toBind[i], handler, false);
    options.leftElement.addEventListener(toBind[i], handler, false);
    options.rightElement.addEventListener(toBind[i], handler, false);
  }
  options.wrap.mousewheelLineHeight = parseInt(getStyle(options.element, 'fontSize'), 10);
  options.wrap.mousewheelPageHeight = _height(options.wrap);
  options.leftElement.mousewheelLineHeight = parseInt(getStyle(options.wrap, 'fontSize'), 10);
  options.leftElement.mousewheelPageHeight = _height(options.leftElement);
  options.rightElement.mousewheelLineHeight = parseInt(getStyle(options.wrap, 'fontSize'), 10);
  options.rightElement.mousewheelPageHeight = _height(options.rightElement);
}

function unbindMouseWheel(options)
{
  function handler(e)
  {
    mouseWheelHandler(e, options);
  }
  for (var i = toBind.length; i;) {
    i -= 1;
    options.wrap.removeEventListener(toBind[i], handler);
    options.leftElement.removeEventListener(toBind[i], handler);
    options.rightElement.removeEventListener(toBind[i], handler);
  }
}

module.exports = {
  bind: bindMouseWheel,
  unbind: unbindMouseWheel
};
