(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global FRAMES_PER_SECOND */
var lastTimeout = 0;

function bindTimeout (currValue, millSecsPerFrame, cb, value)
{
  setTimeout(function () {
    if (typeof cb === 'function')  {
      cb(value);
    }
  }, lastTimeout + millSecsPerFrame);
}

module.exports = function (fromValue, toValue, millsecs, ease, cb)
{
  var frames = FRAMES_PER_SECOND / 1000 * millsecs;
  var diff = toValue - fromValue;
  var i;
  var currValue;
  var millSecsPerFrame = millsecs / frames;
  lastTimeout = 0;
  for (i = 1; i <= frames; i++) {
    currValue = ease(i / frames);
    bindTimeout(currValue, millSecsPerFrame, cb, fromValue + currValue * diff);
    lastTimeout += millSecsPerFrame;
  }
};

},{}],2:[function(require,module,exports){
var animation = require('./animation');
var checkToLimitOffset = require('./check-to-limit-offset');
var InOut = require('./ease').InOut;
var _forEach = require('./poly')._forEach;
var slide = require('./slide');
var cachedElements = require('./cached-elements');
var bindTouchEvents = require('./touch-events');
var bindMouseEvents = require('./mouse-wheel');

function slideWidthElement(element, offset)
{
  _forEach(cachedElements(), function (options)
  {
    if (options.element === element) {
      options.offset = offset;
      slide(options);
    }
  });
}

function animationSlideWithElement(element, offset)
{
  _forEach(cachedElements(), function (options)
  {
    if (options.element === element) {
      animation(options.offset, checkToLimitOffset(options, offset), 500, InOut, function (value)
      {
        options.offset = value;
        slide(options);
      });
    }
  });
}

function destroyByElement(element)
{
  _forEach(cachedElements(), function (options, index)
  {
    if (options.element === element) {
      _forEach(options.childs, function (item)
      {
        options.element.appendChild(item);
        item.style.position = '';
        item.style.left = '';
        item.style.width = '';
      });
      options.element.removeChild(options.leftElement);
      options.element.removeChild(options.rightElement);
      options.element.removeChild(options.wrap);
      options.element.style.position = '';
      options.element.style.height = '';
      bindTouchEvents.unbind(options);
      bindMouseEvents.unbind(options);
      cachedElements.del(index);
    }
  });
}

module.exports ={
  slideWidthElement: slideWidthElement,
  animationSlideWithElement: animationSlideWithElement,
  destroyByElement: destroyByElement
};

},{"./animation":1,"./cached-elements":3,"./check-to-limit-offset":4,"./ease":6,"./mouse-wheel":8,"./poly":9,"./slide":10,"./touch-events":12}],3:[function(require,module,exports){
var elements = [];

function cachedElements()
{
  return elements;
}

cachedElements.push = function (element)
{
  elements.push(element);
};
cachedElements.del = function (index)
{
  elements.splice(index, 1);
};

module.exports = cachedElements;

},{}],4:[function(require,module,exports){
module.exports = function checkToLimitOffset(options, value)
{
  if (value > options.wrapWidth - options.elementWidth) {
    value = options.wrapWidth - options.elementWidth;
  }
  if (value < 0) {
    value = 0;
  }
  return value;
};

},{}],5:[function(require,module,exports){
var animation = require('./animation');
var slide = require('./slide');
var InOut = require('./ease').InOut;
var checkToLimitOffset = require('./check-to-limit-offset');
module.exports = function (options)
{
  options.rightElement.addEventListener('click', function (e)
  {
    animation(options.offset, checkToLimitOffset(options, options.offset + parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
    {
      options.offset = value;
      slide(options);
    });
    e.preventDefault();
    e.stopPropagation();
  }, false);

  options.leftElement.addEventListener('click', function (e)
  {
    animation(options.offset, checkToLimitOffset(options, options.offset - parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
    {
      options.offset = value;
      slide(options);
    });
    e.preventDefault();
    e.stopPropagation();
  }, false);
};

},{"./animation":1,"./check-to-limit-offset":4,"./ease":6,"./slide":10}],6:[function(require,module,exports){
// Ease function in-out
function InOut (k)
{
  if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
  return - 0.5 * ( --k * ( k - 2 ) - 1 );
}

// Ease function out-cubic
function OutCubic (p) {
  return (Math.pow((p - 1), 3) + 1);
}

module.exports = {
  InOut: InOut,
  OutCubic: OutCubic
};

},{}],7:[function(require,module,exports){
window.FRAMES_PER_SECOND = 50;

var _forEach = require('./poly')._forEach;
var _toArray = require('./poly')._toArray;
var _width = require('./poly')._width;
var _height = require('./poly')._height;
var _getOffset = require('./poly')._getOffset;
var cachedElements = require('./cached-elements');
var slide = require('./slide');
var work = require('./work');
var bindClickEvents = require('./click-events');
var bindMouseEvents = require('./mouse-wheel');
var bindTouchEvents = require('./touch-events');

// most logic here
require('./tabflow');

var elements = document.querySelectorAll('[data-tabs]');
_forEach(elements, create);

function create(element, defaultOffset)
{
  var options = {};
  defaultOffset || (defaultOffset = 0);
  options.element = element;
  options.childs = _toArray(element.childNodes);
  options.wrap = document.createElement('div');
  options.wrapWidth = 0;
  options.elementHeight = 0;
  options.elementWidth = _width(element, false);
  options.rightElement = document.createElement('span');
  options.leftElement = document.createElement('span');
  _forEach(options.childs, function (item)
  {
    options.wrapWidth += _width(item, true);
    options.elementHeight = Math.max(options.elementHeight, _height(item));
  });
  _forEach(options.childs, function (item)
  {
    options.wrap.appendChild(item);
  });
  element.appendChild(options.wrap);
  options.wrap.style.width = Math.ceil(options.wrapWidth) + 'px';
  element.style.position = 'relative';
  element.style.height = options.elementHeight + 'px';
  options.wrap.style.height = options.elementHeight + 'px';
  options.wrap.style.position = 'relative';

  options._transition = 30;

  element.appendChild(options.leftElement);
  options.leftElement.style.position = 'absolute';
  options.leftElement.style.top = options.childs[0] ? _getOffset(options.childs[0]).top - _getOffset(element).top + 'px' : 0;
  options.leftElement.style.left = 0;
  options.leftElement.style.height = options.elementHeight + 'px';
  options.leftElement.style.width = '100px';
  options.leftElement.style.zIndex = 1;

  element.appendChild(options.rightElement);
  options.rightElement.style.position = 'absolute';
  options.rightElement.style.top = options.childs.length ? _getOffset(options.childs[options.childs.length - 1]).top - _getOffset(element).top + 'px' : 0;
  options.rightElement.style.right = 0;
  options.rightElement.style.height = options.elementHeight + 'px';
  options.rightElement.style.width = '100px';
  options.rightElement.style.zIndex = 1;

  _forEach(options.childs, function (item)
  {
    item.dataLeft = _getOffset(item).left;
    item.dataWidth = _width(item, true);
    item.dataLastLeft = 0;
    item.isShort = item.dataWidth <= options._transition;
    item.transition = item.isShort ? item.dataWidth - item.dataWidth / 3 : options._transition;
    item.showLine = false;
  });

  _forEach(options.childs, function (item)
  {
    item.style.width = _width(item, false) + 'px';
    item.style.position = 'absolute';
    item.style.left = item.dataLeft + 'px';
  });

  options.offset = 0;
  options.prevOffset = 0;
  options.currentLeft = 0;
  options.currentRight = options.wrapWidth;

  options.leftSlideTransition = 0;
  options.rightSlideTransition = 0;

  cachedElements.push(options);

  bindClickEvents(options);
  bindMouseEvents.bind(options);
  bindTouchEvents.bind(options);

  work(options);

  options.offset = defaultOffset;
  slide(options);
}

var api = require('./api');
window.tabflow = {
  create: create,
  slide: api.slideWidthElement,
  animate: api.animationSlideWithElement,
  destroy: api.destroyByElement
};

window.addEventListener('resize', function ()
{
  _forEach(cachedElements(), function (options)
  {
    options.elementWidth = _width(options.element, false);
    slide(options);
  });
});

},{"./api":2,"./cached-elements":3,"./click-events":5,"./mouse-wheel":8,"./poly":9,"./slide":10,"./tabflow":11,"./touch-events":12,"./work":13}],8:[function(require,module,exports){
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

},{"./poly":9,"./slide":10}],9:[function(require,module,exports){
// This is a small polyphil

// For each Array with callback
function _forEach (elements, cb)
{
  var i, len;
  for (i = 0, len = elements.length; i < len; i = i + 1) {
    if (cb(elements[i], i) === false) {
      break;
    }
  }
}

// For each Array by reversive method with callback
function _forInvEach (elements, cb)
{
  var i;
  for (i = elements.length - 1; i > -1; i = i - 1) {
    if (cb(elements[i], i) === false) {
      break;
    }
  }
}

// Convert `arguments` or NodeList to Array
function _toArray (elements)
{
  var res = [];
  var i, len;
  for (i = 0, len = elements.length; i < len; i = i + 1)
    if (elements[i].nodeType === 1)
      res.push(elements[i]);
  return res;
}

// Function to convert percents or em or something else to pixels
// hack by Dean Edwards http://erik.eae.net/archives/2007/07/27/18.54.15/
function getIEComputedStyle (elem, prop)
{
  var value = elem.currentStyle[prop] || 0;
  var leftCopy = elem.style.left;
  var runtimeLeftCopy = elem.runtimeStyle.left;
  elem.runtimeStyle.left = elem.currentStyle.left;
  elem.style.left = (prop === 'fontSize') ? '1em' : value;
  value = elem.style.pixelLeft + 'px';
  elem.style.left = leftCopy;
  elem.runtimeStyle.left = runtimeLeftCopy;
  elem = null;
  return value;
}

// Cross bworser method to get styles
function getStyle (item, prop)
{
  return (window.getComputedStyle ? window.getComputedStyle(item, '')[prop] : getIEComputedStyle(item, prop));
}

// Calculate width of element
// if `outer` is false then params like padding or border-width or margin
// will not appending to width
function _width (item, outer)
{
  if (typeof outer === 'undefined') outer = true;
  var width = 0;
  var params = ['width'];
  if (outer) params = params.concat(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'marginRight', 'marginLeft']);
  params.map(function (rule) { width += parseFloat(getStyle(item, rule)); });
  return (isNaN(width) ? 0 : width);
}

// Calculate width of element
function _height (item)
{
  var height = 0;
  ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'marginTop', 'marginBottom'].map(function (rule) { height += parseFloat(getStyle(item, rule)); });
  return (isNaN(height) ? 0 : height);
}

// Cross browser method to get offset of element
function _getOffset (elem)
{
  var top;
  var left;
  if (elem.getBoundingClientRect) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    top  = box.top +  scrollTop - clientTop;
    left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
  }
  else {
    top = 0;
    left = 0;
    while(elem) {
      top = top + parseFloat(elem.offsetTop);
      left = left + parseFloat(elem.offsetLeft);
      elem = elem.offsetParent;
    }
    return {top: Math.round(top), left: Math.round(left)};
  }
}

module.exports = {
  _forEach: _forEach,
  _forInvEach: _forInvEach,
  _width: _width,
  _height: _height,
  _getOffset: _getOffset,
  _toArray: _toArray,
  _getStyle: getStyle
};

},{}],10:[function(require,module,exports){
var checkToLimitOffset = require('./check-to-limit-offset');
var work = require('./work');

module.exports = function (options)
{
  options.offset = checkToLimitOffset(options, options.offset);
  options.wrap.style.left = - options.offset + 'px';
  work(options);
};

},{"./check-to-limit-offset":4,"./work":13}],11:[function(require,module,exports){
var _forEach = require('./poly')._forEach;
var _forInvEach = require('./poly')._forInvEach;

module.exports = function (options, _offset)
{
  var prevItem;
  var transition;

  var leftLimit = 0;
  var rightLimit = 0;
  var maxShow = 100;

  options.currentLeft = 0;
  options.currentRight = options.wrapWidth;

  _forEach(options.childs, function (item)
  {
    if (options.currentLeft <= _offset + leftLimit - options.leftSlideTransition) {
      transition = _offset + leftLimit - options.leftSlideTransition;
      if (_offset + leftLimit + item.transition - item.dataWidth - options.leftSlideTransition > options.currentLeft) {
        leftLimit += item.transition;
      }
      item.style.left = transition + 'px';
      item.dataLeft = transition;
      options.currentLeft += item.dataWidth;
    }
    else {
      item.style.left = options.currentLeft + 'px';
      item.dataLeft = options.currentLeft;
      options.currentLeft += item.dataWidth;
    }

    prevItem = item;
  });

  if (leftLimit - options.leftSlideTransition >= maxShow || leftLimit - options.leftSlideTransition <= maxShow - 30 && options.leftSlideTransition > 0) {
    options.leftSlideTransition += _offset - options.prevOffset;
  }

  options.prevOffset = _offset;

  var lastIndex;
  leftLimit = 0;
  options.rightSlideTransition = 0;

  _forInvEach(options.childs, function (item, index)
  {
    prevItem = options.childs[index - 1];
    if (options.currentRight - (item.dataWidth - item.transition) + leftLimit > options.elementWidth + _offset && options.currentRight - (item.dataWidth) > options.elementWidth + _offset - maxShow) {
      lastIndex = index;
      transition = options.currentRight - item.dataWidth - item.transition + rightLimit;
      item.dataLeft = transition;
      item.style.left = transition + 'px';
      rightLimit += prevItem.dataWidth - prevItem.transition;
      leftLimit += item.transition;
    }
    options.currentRight -= parseFloat(item.dataWidth);
  });
  if (leftLimit > maxShow) {
    options.rightSlideTransition = leftLimit - maxShow;
  }

  rightLimit = 0;

  _forEach(options.childs, function (item, index)
  {
    if (index < lastIndex) return ;
    if (!options.childs[lastIndex - 1] || !item.dataLeft) return ;
    if (index === lastIndex) {
      transition = Math.max(options.elementWidth + _offset - leftLimit + options.rightSlideTransition, options.childs[lastIndex - 1].dataLeft + options.childs[lastIndex - 1].transition);
      item.style.left = transition + 'px';
      rightLimit += (transition - options.childs[lastIndex - 1].dataLeft);
    }
    else {
      transition = item.dataLeft - (item.dataLeft - options.childs[lastIndex - 1].dataLeft - options.childs[lastIndex - 1].transition) + rightLimit;
      item.style.left = transition + 'px';
      rightLimit += item.transition;
    }
  });
};

},{"./poly":9}],12:[function(require,module,exports){
var slide = require('./slide');
var animation = require('./animation');
var OutCubic = require('./ease').OutCubic;
var _forEach = require('./poly')._forEach;
var cachedElements = require('./cached-elements');
var opts;
var touchStart = function (e)
{
  e = e || window.event;
  opts.touch.startCoord = e.touches[0].pageX;
  opts.touch.currentCoord = opts.touch.startCoord;
  opts.touch.coords = [opts.touch.startCoord];
  opts.touch.timestamps = [e.timeStamp];
  opts.touch.sliding = true;
};

function bindEvents(options)
{
  opts = options;
  opts.touch = {};
  opts.touch.startCoord;
  opts.touch.currentCoord;
  opts.touch.sliding = false;
  opts.touch.coords = [];
  opts.touch.timestamps = [];
  opts.element.addEventListener('touchstart', touchStart);
}
function unbindEvents(options)
{
  options.element.addEventListener('touchstart', touchStart);
}
document.body.addEventListener('touchmove', function (e)
{
  e = e || window.event;
  _forEach(cachedElements(), function (options)
  {
    if (options.touch.sliding) {
      options.offset -= e.touches[0].pageX - options.touch.currentCoord;
      options.touch.currentCoord = e.touches[0].pageX;
      slide(options);
      options.touch.coords.push(options.touch.currentCoord);
      options.touch.timestamps.push(e.timeStamp);
      if (options.touch.coords.length > 4) {
        options.touch.coords.shift();
        options.touch.timestamps.shift();
      }
    }
  });
});
document.body.addEventListener('touchend', function (e)
{
  e = e || window.event;
  _forEach(cachedElements(), function (options)
  {
    if (options.touch.sliding) {
      animation(options.offset, options.offset - (options.touch.coords[options.touch.coords.length - 1] - options.touch.coords[0]) * 2, (options.touch.timestamps[options.touch.timestamps.length - 1] - options.touch.timestamps[options.touch.timestamps.length - 2]) * 40, OutCubic, function (value)
      {
        options.offset = value;
        slide(options);
      });
      options.touch.sliding = false;
    }
  });
});

// slide by touch event
module.exports = {
  bind: bindEvents,
  unbind: unbindEvents
};

},{"./animation":1,"./cached-elements":3,"./ease":6,"./poly":9,"./slide":10}],13:[function(require,module,exports){
var tabflow = require('./tabflow');

module.exports = function (options, _offset)
{
  var i;
  if (!_offset) _offset = options.offset;
  if (_offset - options.prevOffset < -2) {
    for (i = options.prevOffset; i > _offset; i -= 1) {
      tabflow(options, i);
    }
    tabflow(options, _offset);
  }
  else if (_offset - options.prevOffset > 2) {
    for (i = options.prevOffset; i < _offset; i += 1) {
      tabflow(options, i);
    }
    tabflow(options, _offset);
  }
  else {
    tabflow(options, _offset);
  }
};

},{"./tabflow":11}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkyL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYW5pbWF0aW9uLmpzIiwic3JjL2FwaS5qcyIsInNyYy9jYWNoZWQtZWxlbWVudHMuanMiLCJzcmMvY2hlY2stdG8tbGltaXQtb2Zmc2V0LmpzIiwic3JjL2NsaWNrLWV2ZW50cy5qcyIsInNyYy9lYXNlLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL21vdXNlLXdoZWVsLmpzIiwic3JjL3BvbHkuanMiLCJzcmMvc2xpZGUuanMiLCJzcmMvdGFiZmxvdy5qcyIsInNyYy90b3VjaC1ldmVudHMuanMiLCJzcmMvd29yay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgRlJBTUVTX1BFUl9TRUNPTkQgKi9cbnZhciBsYXN0VGltZW91dCA9IDA7XG5cbmZ1bmN0aW9uIGJpbmRUaW1lb3V0IChjdXJyVmFsdWUsIG1pbGxTZWNzUGVyRnJhbWUsIGNiLCB2YWx1ZSlcbntcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgIHtcbiAgICAgIGNiKHZhbHVlKTtcbiAgICB9XG4gIH0sIGxhc3RUaW1lb3V0ICsgbWlsbFNlY3NQZXJGcmFtZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb21WYWx1ZSwgdG9WYWx1ZSwgbWlsbHNlY3MsIGVhc2UsIGNiKVxue1xuICB2YXIgZnJhbWVzID0gRlJBTUVTX1BFUl9TRUNPTkQgLyAxMDAwICogbWlsbHNlY3M7XG4gIHZhciBkaWZmID0gdG9WYWx1ZSAtIGZyb21WYWx1ZTtcbiAgdmFyIGk7XG4gIHZhciBjdXJyVmFsdWU7XG4gIHZhciBtaWxsU2Vjc1BlckZyYW1lID0gbWlsbHNlY3MgLyBmcmFtZXM7XG4gIGxhc3RUaW1lb3V0ID0gMDtcbiAgZm9yIChpID0gMTsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgIGN1cnJWYWx1ZSA9IGVhc2UoaSAvIGZyYW1lcyk7XG4gICAgYmluZFRpbWVvdXQoY3VyclZhbHVlLCBtaWxsU2Vjc1BlckZyYW1lLCBjYiwgZnJvbVZhbHVlICsgY3VyclZhbHVlICogZGlmZik7XG4gICAgbGFzdFRpbWVvdXQgKz0gbWlsbFNlY3NQZXJGcmFtZTtcbiAgfVxufTtcbiIsInZhciBhbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbicpO1xudmFyIGNoZWNrVG9MaW1pdE9mZnNldCA9IHJlcXVpcmUoJy4vY2hlY2stdG8tbGltaXQtb2Zmc2V0Jyk7XG52YXIgSW5PdXQgPSByZXF1aXJlKCcuL2Vhc2UnKS5Jbk91dDtcbnZhciBfZm9yRWFjaCA9IHJlcXVpcmUoJy4vcG9seScpLl9mb3JFYWNoO1xudmFyIHNsaWRlID0gcmVxdWlyZSgnLi9zbGlkZScpO1xudmFyIGNhY2hlZEVsZW1lbnRzID0gcmVxdWlyZSgnLi9jYWNoZWQtZWxlbWVudHMnKTtcbnZhciBiaW5kVG91Y2hFdmVudHMgPSByZXF1aXJlKCcuL3RvdWNoLWV2ZW50cycpO1xudmFyIGJpbmRNb3VzZUV2ZW50cyA9IHJlcXVpcmUoJy4vbW91c2Utd2hlZWwnKTtcblxuZnVuY3Rpb24gc2xpZGVXaWR0aEVsZW1lbnQoZWxlbWVudCwgb2Zmc2V0KVxue1xuICBfZm9yRWFjaChjYWNoZWRFbGVtZW50cygpLCBmdW5jdGlvbiAob3B0aW9ucylcbiAge1xuICAgIGlmIChvcHRpb25zLmVsZW1lbnQgPT09IGVsZW1lbnQpIHtcbiAgICAgIG9wdGlvbnMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgc2xpZGUob3B0aW9ucyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYW5pbWF0aW9uU2xpZGVXaXRoRWxlbWVudChlbGVtZW50LCBvZmZzZXQpXG57XG4gIF9mb3JFYWNoKGNhY2hlZEVsZW1lbnRzKCksIGZ1bmN0aW9uIChvcHRpb25zKVxuICB7XG4gICAgaWYgKG9wdGlvbnMuZWxlbWVudCA9PT0gZWxlbWVudCkge1xuICAgICAgYW5pbWF0aW9uKG9wdGlvbnMub2Zmc2V0LCBjaGVja1RvTGltaXRPZmZzZXQob3B0aW9ucywgb2Zmc2V0KSwgNTAwLCBJbk91dCwgZnVuY3Rpb24gKHZhbHVlKVxuICAgICAge1xuICAgICAgICBvcHRpb25zLm9mZnNldCA9IHZhbHVlO1xuICAgICAgICBzbGlkZShvcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3lCeUVsZW1lbnQoZWxlbWVudClcbntcbiAgX2ZvckVhY2goY2FjaGVkRWxlbWVudHMoKSwgZnVuY3Rpb24gKG9wdGlvbnMsIGluZGV4KVxuICB7XG4gICAgaWYgKG9wdGlvbnMuZWxlbWVudCA9PT0gZWxlbWVudCkge1xuICAgICAgX2ZvckVhY2gob3B0aW9ucy5jaGlsZHMsIGZ1bmN0aW9uIChpdGVtKVxuICAgICAge1xuICAgICAgICBvcHRpb25zLmVsZW1lbnQuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgICAgIGl0ZW0uc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgaXRlbS5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgIGl0ZW0uc3R5bGUud2lkdGggPSAnJztcbiAgICAgIH0pO1xuICAgICAgb3B0aW9ucy5lbGVtZW50LnJlbW92ZUNoaWxkKG9wdGlvbnMubGVmdEVsZW1lbnQpO1xuICAgICAgb3B0aW9ucy5lbGVtZW50LnJlbW92ZUNoaWxkKG9wdGlvbnMucmlnaHRFbGVtZW50KTtcbiAgICAgIG9wdGlvbnMuZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb25zLndyYXApO1xuICAgICAgb3B0aW9ucy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJyc7XG4gICAgICBvcHRpb25zLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBiaW5kVG91Y2hFdmVudHMudW5iaW5kKG9wdGlvbnMpO1xuICAgICAgYmluZE1vdXNlRXZlbnRzLnVuYmluZChvcHRpb25zKTtcbiAgICAgIGNhY2hlZEVsZW1lbnRzLmRlbChpbmRleCk7XG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPXtcbiAgc2xpZGVXaWR0aEVsZW1lbnQ6IHNsaWRlV2lkdGhFbGVtZW50LFxuICBhbmltYXRpb25TbGlkZVdpdGhFbGVtZW50OiBhbmltYXRpb25TbGlkZVdpdGhFbGVtZW50LFxuICBkZXN0cm95QnlFbGVtZW50OiBkZXN0cm95QnlFbGVtZW50XG59O1xuIiwidmFyIGVsZW1lbnRzID0gW107XG5cbmZ1bmN0aW9uIGNhY2hlZEVsZW1lbnRzKClcbntcbiAgcmV0dXJuIGVsZW1lbnRzO1xufVxuXG5jYWNoZWRFbGVtZW50cy5wdXNoID0gZnVuY3Rpb24gKGVsZW1lbnQpXG57XG4gIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG59O1xuY2FjaGVkRWxlbWVudHMuZGVsID0gZnVuY3Rpb24gKGluZGV4KVxue1xuICBlbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYWNoZWRFbGVtZW50cztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2hlY2tUb0xpbWl0T2Zmc2V0KG9wdGlvbnMsIHZhbHVlKVxue1xuICBpZiAodmFsdWUgPiBvcHRpb25zLndyYXBXaWR0aCAtIG9wdGlvbnMuZWxlbWVudFdpZHRoKSB7XG4gICAgdmFsdWUgPSBvcHRpb25zLndyYXBXaWR0aCAtIG9wdGlvbnMuZWxlbWVudFdpZHRoO1xuICB9XG4gIGlmICh2YWx1ZSA8IDApIHtcbiAgICB2YWx1ZSA9IDA7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBhbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbicpO1xudmFyIHNsaWRlID0gcmVxdWlyZSgnLi9zbGlkZScpO1xudmFyIEluT3V0ID0gcmVxdWlyZSgnLi9lYXNlJykuSW5PdXQ7XG52YXIgY2hlY2tUb0xpbWl0T2Zmc2V0ID0gcmVxdWlyZSgnLi9jaGVjay10by1saW1pdC1vZmZzZXQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gIG9wdGlvbnMucmlnaHRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpXG4gIHtcbiAgICBhbmltYXRpb24ob3B0aW9ucy5vZmZzZXQsIGNoZWNrVG9MaW1pdE9mZnNldChvcHRpb25zLCBvcHRpb25zLm9mZnNldCArIHBhcnNlSW50KG9wdGlvbnMuZWxlbWVudFdpZHRoICogMC43LCAxMCkpLCAzMDAsIEluT3V0LCBmdW5jdGlvbiAodmFsdWUpXG4gICAge1xuICAgICAgb3B0aW9ucy5vZmZzZXQgPSB2YWx1ZTtcbiAgICAgIHNsaWRlKG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LCBmYWxzZSk7XG5cbiAgb3B0aW9ucy5sZWZ0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKVxuICB7XG4gICAgYW5pbWF0aW9uKG9wdGlvbnMub2Zmc2V0LCBjaGVja1RvTGltaXRPZmZzZXQob3B0aW9ucywgb3B0aW9ucy5vZmZzZXQgLSBwYXJzZUludChvcHRpb25zLmVsZW1lbnRXaWR0aCAqIDAuNywgMTApKSwgMzAwLCBJbk91dCwgZnVuY3Rpb24gKHZhbHVlKVxuICAgIHtcbiAgICAgIG9wdGlvbnMub2Zmc2V0ID0gdmFsdWU7XG4gICAgICBzbGlkZShvcHRpb25zKTtcbiAgICB9KTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSwgZmFsc2UpO1xufTtcbiIsIi8vIEVhc2UgZnVuY3Rpb24gaW4tb3V0XG5mdW5jdGlvbiBJbk91dCAoaylcbntcbiAgaWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiBrICogaztcbiAgcmV0dXJuIC0gMC41ICogKCAtLWsgKiAoIGsgLSAyICkgLSAxICk7XG59XG5cbi8vIEVhc2UgZnVuY3Rpb24gb3V0LWN1YmljXG5mdW5jdGlvbiBPdXRDdWJpYyAocCkge1xuICByZXR1cm4gKE1hdGgucG93KChwIC0gMSksIDMpICsgMSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBJbk91dDogSW5PdXQsXG4gIE91dEN1YmljOiBPdXRDdWJpY1xufTtcbiIsIndpbmRvdy5GUkFNRVNfUEVSX1NFQ09ORCA9IDUwO1xuXG52YXIgX2ZvckVhY2ggPSByZXF1aXJlKCcuL3BvbHknKS5fZm9yRWFjaDtcbnZhciBfdG9BcnJheSA9IHJlcXVpcmUoJy4vcG9seScpLl90b0FycmF5O1xudmFyIF93aWR0aCA9IHJlcXVpcmUoJy4vcG9seScpLl93aWR0aDtcbnZhciBfaGVpZ2h0ID0gcmVxdWlyZSgnLi9wb2x5JykuX2hlaWdodDtcbnZhciBfZ2V0T2Zmc2V0ID0gcmVxdWlyZSgnLi9wb2x5JykuX2dldE9mZnNldDtcbnZhciBjYWNoZWRFbGVtZW50cyA9IHJlcXVpcmUoJy4vY2FjaGVkLWVsZW1lbnRzJyk7XG52YXIgc2xpZGUgPSByZXF1aXJlKCcuL3NsaWRlJyk7XG52YXIgd29yayA9IHJlcXVpcmUoJy4vd29yaycpO1xudmFyIGJpbmRDbGlja0V2ZW50cyA9IHJlcXVpcmUoJy4vY2xpY2stZXZlbnRzJyk7XG52YXIgYmluZE1vdXNlRXZlbnRzID0gcmVxdWlyZSgnLi9tb3VzZS13aGVlbCcpO1xudmFyIGJpbmRUb3VjaEV2ZW50cyA9IHJlcXVpcmUoJy4vdG91Y2gtZXZlbnRzJyk7XG5cbi8vIG1vc3QgbG9naWMgaGVyZVxucmVxdWlyZSgnLi90YWJmbG93Jyk7XG5cbnZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRhYnNdJyk7XG5fZm9yRWFjaChlbGVtZW50cywgY3JlYXRlKTtcblxuZnVuY3Rpb24gY3JlYXRlKGVsZW1lbnQsIGRlZmF1bHRPZmZzZXQpXG57XG4gIHZhciBvcHRpb25zID0ge307XG4gIGRlZmF1bHRPZmZzZXQgfHwgKGRlZmF1bHRPZmZzZXQgPSAwKTtcbiAgb3B0aW9ucy5lbGVtZW50ID0gZWxlbWVudDtcbiAgb3B0aW9ucy5jaGlsZHMgPSBfdG9BcnJheShlbGVtZW50LmNoaWxkTm9kZXMpO1xuICBvcHRpb25zLndyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgb3B0aW9ucy53cmFwV2lkdGggPSAwO1xuICBvcHRpb25zLmVsZW1lbnRIZWlnaHQgPSAwO1xuICBvcHRpb25zLmVsZW1lbnRXaWR0aCA9IF93aWR0aChlbGVtZW50LCBmYWxzZSk7XG4gIG9wdGlvbnMucmlnaHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBvcHRpb25zLmxlZnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBfZm9yRWFjaChvcHRpb25zLmNoaWxkcywgZnVuY3Rpb24gKGl0ZW0pXG4gIHtcbiAgICBvcHRpb25zLndyYXBXaWR0aCArPSBfd2lkdGgoaXRlbSwgdHJ1ZSk7XG4gICAgb3B0aW9ucy5lbGVtZW50SGVpZ2h0ID0gTWF0aC5tYXgob3B0aW9ucy5lbGVtZW50SGVpZ2h0LCBfaGVpZ2h0KGl0ZW0pKTtcbiAgfSk7XG4gIF9mb3JFYWNoKG9wdGlvbnMuY2hpbGRzLCBmdW5jdGlvbiAoaXRlbSlcbiAge1xuICAgIG9wdGlvbnMud3JhcC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgfSk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9ucy53cmFwKTtcbiAgb3B0aW9ucy53cmFwLnN0eWxlLndpZHRoID0gTWF0aC5jZWlsKG9wdGlvbnMud3JhcFdpZHRoKSArICdweCc7XG4gIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICBlbGVtZW50LnN0eWxlLmhlaWdodCA9IG9wdGlvbnMuZWxlbWVudEhlaWdodCArICdweCc7XG4gIG9wdGlvbnMud3JhcC5zdHlsZS5oZWlnaHQgPSBvcHRpb25zLmVsZW1lbnRIZWlnaHQgKyAncHgnO1xuICBvcHRpb25zLndyYXAuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuXG4gIG9wdGlvbnMuX3RyYW5zaXRpb24gPSAzMDtcblxuICBlbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbnMubGVmdEVsZW1lbnQpO1xuICBvcHRpb25zLmxlZnRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgb3B0aW9ucy5sZWZ0RWxlbWVudC5zdHlsZS50b3AgPSBvcHRpb25zLmNoaWxkc1swXSA/IF9nZXRPZmZzZXQob3B0aW9ucy5jaGlsZHNbMF0pLnRvcCAtIF9nZXRPZmZzZXQoZWxlbWVudCkudG9wICsgJ3B4JyA6IDA7XG4gIG9wdGlvbnMubGVmdEVsZW1lbnQuc3R5bGUubGVmdCA9IDA7XG4gIG9wdGlvbnMubGVmdEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5lbGVtZW50SGVpZ2h0ICsgJ3B4JztcbiAgb3B0aW9ucy5sZWZ0RWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDBweCc7XG4gIG9wdGlvbnMubGVmdEVsZW1lbnQuc3R5bGUuekluZGV4ID0gMTtcblxuICBlbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbnMucmlnaHRFbGVtZW50KTtcbiAgb3B0aW9ucy5yaWdodEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBvcHRpb25zLnJpZ2h0RWxlbWVudC5zdHlsZS50b3AgPSBvcHRpb25zLmNoaWxkcy5sZW5ndGggPyBfZ2V0T2Zmc2V0KG9wdGlvbnMuY2hpbGRzW29wdGlvbnMuY2hpbGRzLmxlbmd0aCAtIDFdKS50b3AgLSBfZ2V0T2Zmc2V0KGVsZW1lbnQpLnRvcCArICdweCcgOiAwO1xuICBvcHRpb25zLnJpZ2h0RWxlbWVudC5zdHlsZS5yaWdodCA9IDA7XG4gIG9wdGlvbnMucmlnaHRFbGVtZW50LnN0eWxlLmhlaWdodCA9IG9wdGlvbnMuZWxlbWVudEhlaWdodCArICdweCc7XG4gIG9wdGlvbnMucmlnaHRFbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMHB4JztcbiAgb3B0aW9ucy5yaWdodEVsZW1lbnQuc3R5bGUuekluZGV4ID0gMTtcblxuICBfZm9yRWFjaChvcHRpb25zLmNoaWxkcywgZnVuY3Rpb24gKGl0ZW0pXG4gIHtcbiAgICBpdGVtLmRhdGFMZWZ0ID0gX2dldE9mZnNldChpdGVtKS5sZWZ0O1xuICAgIGl0ZW0uZGF0YVdpZHRoID0gX3dpZHRoKGl0ZW0sIHRydWUpO1xuICAgIGl0ZW0uZGF0YUxhc3RMZWZ0ID0gMDtcbiAgICBpdGVtLmlzU2hvcnQgPSBpdGVtLmRhdGFXaWR0aCA8PSBvcHRpb25zLl90cmFuc2l0aW9uO1xuICAgIGl0ZW0udHJhbnNpdGlvbiA9IGl0ZW0uaXNTaG9ydCA/IGl0ZW0uZGF0YVdpZHRoIC0gaXRlbS5kYXRhV2lkdGggLyAzIDogb3B0aW9ucy5fdHJhbnNpdGlvbjtcbiAgICBpdGVtLnNob3dMaW5lID0gZmFsc2U7XG4gIH0pO1xuXG4gIF9mb3JFYWNoKG9wdGlvbnMuY2hpbGRzLCBmdW5jdGlvbiAoaXRlbSlcbiAge1xuICAgIGl0ZW0uc3R5bGUud2lkdGggPSBfd2lkdGgoaXRlbSwgZmFsc2UpICsgJ3B4JztcbiAgICBpdGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBpdGVtLnN0eWxlLmxlZnQgPSBpdGVtLmRhdGFMZWZ0ICsgJ3B4JztcbiAgfSk7XG5cbiAgb3B0aW9ucy5vZmZzZXQgPSAwO1xuICBvcHRpb25zLnByZXZPZmZzZXQgPSAwO1xuICBvcHRpb25zLmN1cnJlbnRMZWZ0ID0gMDtcbiAgb3B0aW9ucy5jdXJyZW50UmlnaHQgPSBvcHRpb25zLndyYXBXaWR0aDtcblxuICBvcHRpb25zLmxlZnRTbGlkZVRyYW5zaXRpb24gPSAwO1xuICBvcHRpb25zLnJpZ2h0U2xpZGVUcmFuc2l0aW9uID0gMDtcblxuICBjYWNoZWRFbGVtZW50cy5wdXNoKG9wdGlvbnMpO1xuXG4gIGJpbmRDbGlja0V2ZW50cyhvcHRpb25zKTtcbiAgYmluZE1vdXNlRXZlbnRzLmJpbmQob3B0aW9ucyk7XG4gIGJpbmRUb3VjaEV2ZW50cy5iaW5kKG9wdGlvbnMpO1xuXG4gIHdvcmsob3B0aW9ucyk7XG5cbiAgb3B0aW9ucy5vZmZzZXQgPSBkZWZhdWx0T2Zmc2V0O1xuICBzbGlkZShvcHRpb25zKTtcbn1cblxudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG53aW5kb3cudGFiZmxvdyA9IHtcbiAgY3JlYXRlOiBjcmVhdGUsXG4gIHNsaWRlOiBhcGkuc2xpZGVXaWR0aEVsZW1lbnQsXG4gIGFuaW1hdGU6IGFwaS5hbmltYXRpb25TbGlkZVdpdGhFbGVtZW50LFxuICBkZXN0cm95OiBhcGkuZGVzdHJveUJ5RWxlbWVudFxufTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpXG57XG4gIF9mb3JFYWNoKGNhY2hlZEVsZW1lbnRzKCksIGZ1bmN0aW9uIChvcHRpb25zKVxuICB7XG4gICAgb3B0aW9ucy5lbGVtZW50V2lkdGggPSBfd2lkdGgob3B0aW9ucy5lbGVtZW50LCBmYWxzZSk7XG4gICAgc2xpZGUob3B0aW9ucyk7XG4gIH0pO1xufSk7XG4iLCJ2YXIgc2xpZGUgPSByZXF1aXJlKCcuL3NsaWRlJyk7XG52YXIgZ2V0U3R5bGUgPSByZXF1aXJlKCcuL3BvbHknKS5fZ2V0U3R5bGU7XG52YXIgX2hlaWdodCA9IHJlcXVpcmUoJy4vcG9seScpLl9oZWlnaHQ7XG52YXIgbG93ZXN0RGVsdGE7XG5cbmZ1bmN0aW9uIHNob3VsZEFkanVzdE9sZERlbHRhcyhvcmdFdmVudCwgYWJzRGVsdGEpXG57XG4gIC8vIElmIHRoaXMgaXMgYW4gb2xkZXIgZXZlbnQgYW5kIHRoZSBkZWx0YSBpcyBkaXZpc2FibGUgYnkgMTIwLFxuICAvLyB0aGVuIHdlIGFyZSBhc3N1bWluZyB0aGF0IHRoZSBicm93c2VyIGlzIHRyZWF0aW5nIHRoaXMgYXMgYW5cbiAgLy8gb2xkZXIgbW91c2Ugd2hlZWwgZXZlbnQgYW5kIHRoYXQgd2Ugc2hvdWxkIGRpdmlkZSB0aGUgZGVsdGFzXG4gIC8vIGJ5IDQwIHRvIHRyeSBhbmQgZ2V0IGEgbW9yZSB1c2FibGUgZGVsdGFGYWN0b3IuXG4gIC8vIFNpZGUgbm90ZSwgdGhpcyBhY3R1YWxseSBpbXBhY3RzIHRoZSByZXBvcnRlZCBzY3JvbGwgZGlzdGFuY2VcbiAgLy8gaW4gb2xkZXIgYnJvd3NlcnMgYW5kIGNhbiBjYXVzZSBzY3JvbGxpbmcgdG8gYmUgc2xvd2VyIHRoYW4gbmF0aXZlLlxuICAvLyBUdXJuIHRoaXMgb2ZmIGJ5IHNldHRpbmcgJC5ldmVudC5zcGVjaWFsLm1vdXNld2hlZWwuc2V0dGluZ3MuYWRqdXN0T2xkRGVsdGFzIHRvIGZhbHNlLlxuICByZXR1cm4gb3JnRXZlbnQudHlwZSA9PT0gJ21vdXNld2hlZWwnICYmIGFic0RlbHRhICUgMTIwID09PSAwO1xufVxuXG5mdW5jdGlvbiBtb3VzZVdoZWVsSGFuZGxlcihlLCBvcHRpb25zKVxue1xuICB2YXIgb3JnRXZlbnQgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgb3JnRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGRlbHRhICAgICAgPSAwO1xuICB2YXIgZGVsdGFYICAgICA9IDA7XG4gIHZhciBkZWx0YVkgICAgID0gMDtcbiAgdmFyIGFic0RlbHRhICAgPSAwO1xuXG4gIC8vIE9sZCBzY2hvb2wgc2Nyb2xsd2hlZWwgZGVsdGFcbiAgaWYgKCAnZGV0YWlsJyAgICAgIGluIG9yZ0V2ZW50ICkgeyBkZWx0YVkgPSBvcmdFdmVudC5kZXRhaWwgKiAtMTsgICAgICB9XG4gIGlmICggJ3doZWVsRGVsdGEnICBpbiBvcmdFdmVudCApIHsgZGVsdGFZID0gb3JnRXZlbnQud2hlZWxEZWx0YTsgICAgICAgfVxuICBpZiAoICd3aGVlbERlbHRhWScgaW4gb3JnRXZlbnQgKSB7IGRlbHRhWSA9IG9yZ0V2ZW50LndoZWVsRGVsdGFZOyAgICAgIH1cbiAgaWYgKCAnd2hlZWxEZWx0YVgnIGluIG9yZ0V2ZW50ICkgeyBkZWx0YVggPSBvcmdFdmVudC53aGVlbERlbHRhWCAqIC0xOyB9XG5cbiAgLy8gRmlyZWZveCA8IDE3IGhvcml6b250YWwgc2Nyb2xsaW5nIHJlbGF0ZWQgdG8gRE9NTW91c2VTY3JvbGwgZXZlbnRcbiAgaWYgKCAnYXhpcycgaW4gb3JnRXZlbnQgJiYgb3JnRXZlbnQuYXhpcyA9PT0gb3JnRXZlbnQuSE9SSVpPTlRBTF9BWElTICkge1xuICAgIGRlbHRhWCA9IGRlbHRhWSAqIC0xO1xuICAgIGRlbHRhWSA9IDA7XG4gIH1cblxuICAvLyBTZXQgZGVsdGEgdG8gYmUgZGVsdGFZIG9yIGRlbHRhWCBpZiBkZWx0YVkgaXMgMCBmb3IgYmFja3dhcmRzIGNvbXBhdGFiaWxpdGl5XG4gIGRlbHRhID0gZGVsdGFZID09PSAwID8gZGVsdGFYIDogZGVsdGFZO1xuXG4gIC8vIE5ldyBzY2hvb2wgd2hlZWwgZGVsdGEgKHdoZWVsIGV2ZW50KVxuICBpZiAoICdkZWx0YVknIGluIG9yZ0V2ZW50ICkge1xuICAgIGRlbHRhWSA9IG9yZ0V2ZW50LmRlbHRhWSAqIC0xO1xuICAgIGRlbHRhICA9IGRlbHRhWTtcbiAgfVxuICBpZiAoICdkZWx0YVgnIGluIG9yZ0V2ZW50ICkge1xuICAgIGRlbHRhWCA9IG9yZ0V2ZW50LmRlbHRhWDtcbiAgICBpZiAoIGRlbHRhWSA9PT0gMCApIHsgZGVsdGEgID0gZGVsdGFYICogLTE7IH1cbiAgfVxuXG4gIC8vIE5vIGNoYW5nZSBhY3R1YWxseSBoYXBwZW5lZCwgbm8gcmVhc29uIHRvIGdvIGFueSBmdXJ0aGVyXG4gIGlmICggZGVsdGFZID09PSAwICYmIGRlbHRhWCA9PT0gMCApIHsgcmV0dXJuOyB9XG5cbiAgLy8gTmVlZCB0byBjb252ZXJ0IGxpbmVzIGFuZCBwYWdlcyB0byBwaXhlbHMgaWYgd2UgYXJlbid0IGFscmVhZHkgaW4gcGl4ZWxzXG4gIC8vIFRoZXJlIGFyZSB0aHJlZSBkZWx0YSBtb2RlczpcbiAgLy8gICAqIGRlbHRhTW9kZSAwIGlzIGJ5IHBpeGVscywgbm90aGluZyB0byBkb1xuICAvLyAgICogZGVsdGFNb2RlIDEgaXMgYnkgbGluZXNcbiAgLy8gICAqIGRlbHRhTW9kZSAyIGlzIGJ5IHBhZ2VzXG4gIGlmIChvcmdFdmVudC5kZWx0YU1vZGUgPT09IDEpIHtcbiAgICB2YXIgbGluZUhlaWdodCA9IHRoaXMubW91c2V3aGVlbExpbmVIZWlnaHQ7XG4gICAgZGVsdGEgICo9IGxpbmVIZWlnaHQ7XG4gICAgZGVsdGFZICo9IGxpbmVIZWlnaHQ7XG4gICAgZGVsdGFYICo9IGxpbmVIZWlnaHQ7XG4gIH1cbiAgZWxzZSBpZiAoIG9yZ0V2ZW50LmRlbHRhTW9kZSA9PT0gMiApIHtcbiAgICB2YXIgcGFnZUhlaWdodCA9IHRoaXMubW91c2V3aGVlbFBhZ2VIZWlnaHQ7XG4gICAgZGVsdGEgICo9IHBhZ2VIZWlnaHQ7XG4gICAgZGVsdGFZICo9IHBhZ2VIZWlnaHQ7XG4gICAgZGVsdGFYICo9IHBhZ2VIZWlnaHQ7XG4gIH1cblxuICAvLyBTdG9yZSBsb3dlc3QgYWJzb2x1dGUgZGVsdGEgdG8gbm9ybWFsaXplIHRoZSBkZWx0YSB2YWx1ZXNcbiAgYWJzRGVsdGEgPSBNYXRoLm1heCggTWF0aC5hYnMoZGVsdGFZKSwgTWF0aC5hYnMoZGVsdGFYKSApO1xuXG4gIGlmICggIWxvd2VzdERlbHRhIHx8IGFic0RlbHRhIDwgbG93ZXN0RGVsdGEgKSB7XG4gICAgbG93ZXN0RGVsdGEgPSBhYnNEZWx0YTtcblxuICAgIC8vIEFkanVzdCBvbGRlciBkZWx0YXMgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCBzaG91bGRBZGp1c3RPbGREZWx0YXMob3JnRXZlbnQsIGFic0RlbHRhKSApIHtcbiAgICAgICAgbG93ZXN0RGVsdGEgLz0gNDA7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRqdXN0IG9sZGVyIGRlbHRhcyBpZiBuZWNlc3NhcnlcbiAgaWYgKCBzaG91bGRBZGp1c3RPbGREZWx0YXMob3JnRXZlbnQsIGFic0RlbHRhKSApIHtcbiAgLy8gRGl2aWRlIGFsbCB0aGUgdGhpbmdzIGJ5IDQwIVxuICAgIGRlbHRhICAvPSA0MDtcbiAgICBkZWx0YVggLz0gNDA7XG4gICAgZGVsdGFZIC89IDQwO1xuICB9XG5cbiAgLy8gR2V0IGEgd2hvbGUsIG5vcm1hbGl6ZWQgdmFsdWUgZm9yIHRoZSBkZWx0YXNcbiAgZGVsdGEgID0gTWF0aFsgZGVsdGEgID49IDEgPyAnZmxvb3InIDogJ2NlaWwnIF0oZGVsdGEgIC8gbG93ZXN0RGVsdGEpO1xuICBkZWx0YVggPSBNYXRoWyBkZWx0YVggPj0gMSA/ICdmbG9vcicgOiAnY2VpbCcgXShkZWx0YVggLyBsb3dlc3REZWx0YSk7XG4gIGRlbHRhWSA9IE1hdGhbIGRlbHRhWSA+PSAxID8gJ2Zsb29yJyA6ICdjZWlsJyBdKGRlbHRhWSAvIGxvd2VzdERlbHRhKTtcblxuICBvcHRpb25zLm9mZnNldCArPSBkZWx0YVg7XG4gIHNsaWRlKG9wdGlvbnMpO1xufVxuXG52YXIgdG9CaW5kID0gKCAnb253aGVlbCcgaW4gZG9jdW1lbnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID49IDkgKSA/IFsnd2hlZWwnXSA6IFsnbW91c2V3aGVlbCcsICdEb21Nb3VzZVNjcm9sbCcsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJ107XG5cbmZ1bmN0aW9uIGJpbmRNb3VzZVdoZWVsKG9wdGlvbnMpXG57XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZSlcbiAge1xuICAgIG1vdXNlV2hlZWxIYW5kbGVyKGUsIG9wdGlvbnMpO1xuICB9XG4gIGZvciAodmFyIGkgPSB0b0JpbmQubGVuZ3RoOyBpOykge1xuICAgIGkgLT0gMTtcbiAgICBvcHRpb25zLndyYXAuYWRkRXZlbnRMaXN0ZW5lcih0b0JpbmRbaV0sIGhhbmRsZXIsIGZhbHNlKTtcbiAgICBvcHRpb25zLmxlZnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodG9CaW5kW2ldLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgb3B0aW9ucy5yaWdodEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0b0JpbmRbaV0sIGhhbmRsZXIsIGZhbHNlKTtcbiAgfVxuICBvcHRpb25zLndyYXAubW91c2V3aGVlbExpbmVIZWlnaHQgPSBwYXJzZUludChnZXRTdHlsZShvcHRpb25zLmVsZW1lbnQsICdmb250U2l6ZScpLCAxMCk7XG4gIG9wdGlvbnMud3JhcC5tb3VzZXdoZWVsUGFnZUhlaWdodCA9IF9oZWlnaHQob3B0aW9ucy53cmFwKTtcbiAgb3B0aW9ucy5sZWZ0RWxlbWVudC5tb3VzZXdoZWVsTGluZUhlaWdodCA9IHBhcnNlSW50KGdldFN0eWxlKG9wdGlvbnMud3JhcCwgJ2ZvbnRTaXplJyksIDEwKTtcbiAgb3B0aW9ucy5sZWZ0RWxlbWVudC5tb3VzZXdoZWVsUGFnZUhlaWdodCA9IF9oZWlnaHQob3B0aW9ucy5sZWZ0RWxlbWVudCk7XG4gIG9wdGlvbnMucmlnaHRFbGVtZW50Lm1vdXNld2hlZWxMaW5lSGVpZ2h0ID0gcGFyc2VJbnQoZ2V0U3R5bGUob3B0aW9ucy53cmFwLCAnZm9udFNpemUnKSwgMTApO1xuICBvcHRpb25zLnJpZ2h0RWxlbWVudC5tb3VzZXdoZWVsUGFnZUhlaWdodCA9IF9oZWlnaHQob3B0aW9ucy5yaWdodEVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiB1bmJpbmRNb3VzZVdoZWVsKG9wdGlvbnMpXG57XG4gIGZ1bmN0aW9uIGhhbmRsZXIoZSlcbiAge1xuICAgIG1vdXNlV2hlZWxIYW5kbGVyKGUsIG9wdGlvbnMpO1xuICB9XG4gIGZvciAodmFyIGkgPSB0b0JpbmQubGVuZ3RoOyBpOykge1xuICAgIGkgLT0gMTtcbiAgICBvcHRpb25zLndyYXAucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b0JpbmRbaV0sIGhhbmRsZXIpO1xuICAgIG9wdGlvbnMubGVmdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b0JpbmRbaV0sIGhhbmRsZXIpO1xuICAgIG9wdGlvbnMucmlnaHRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodG9CaW5kW2ldLCBoYW5kbGVyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZE1vdXNlV2hlZWwsXG4gIHVuYmluZDogdW5iaW5kTW91c2VXaGVlbFxufTtcbiIsIi8vIFRoaXMgaXMgYSBzbWFsbCBwb2x5cGhpbFxuXG4vLyBGb3IgZWFjaCBBcnJheSB3aXRoIGNhbGxiYWNrXG5mdW5jdGlvbiBfZm9yRWFjaCAoZWxlbWVudHMsIGNiKVxue1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkgPSBpICsgMSkge1xuICAgIGlmIChjYihlbGVtZW50c1tpXSwgaSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuLy8gRm9yIGVhY2ggQXJyYXkgYnkgcmV2ZXJzaXZlIG1ldGhvZCB3aXRoIGNhbGxiYWNrXG5mdW5jdGlvbiBfZm9ySW52RWFjaCAoZWxlbWVudHMsIGNiKVxue1xuICB2YXIgaTtcbiAgZm9yIChpID0gZWxlbWVudHMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpID0gaSAtIDEpIHtcbiAgICBpZiAoY2IoZWxlbWVudHNbaV0sIGkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG5cbi8vIENvbnZlcnQgYGFyZ3VtZW50c2Agb3IgTm9kZUxpc3QgdG8gQXJyYXlcbmZ1bmN0aW9uIF90b0FycmF5IChlbGVtZW50cylcbntcbiAgdmFyIHJlcyA9IFtdO1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkgPSBpICsgMSlcbiAgICBpZiAoZWxlbWVudHNbaV0ubm9kZVR5cGUgPT09IDEpXG4gICAgICByZXMucHVzaChlbGVtZW50c1tpXSk7XG4gIHJldHVybiByZXM7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIGNvbnZlcnQgcGVyY2VudHMgb3IgZW0gb3Igc29tZXRoaW5nIGVsc2UgdG8gcGl4ZWxzXG4vLyBoYWNrIGJ5IERlYW4gRWR3YXJkcyBodHRwOi8vZXJpay5lYWUubmV0L2FyY2hpdmVzLzIwMDcvMDcvMjcvMTguNTQuMTUvXG5mdW5jdGlvbiBnZXRJRUNvbXB1dGVkU3R5bGUgKGVsZW0sIHByb3ApXG57XG4gIHZhciB2YWx1ZSA9IGVsZW0uY3VycmVudFN0eWxlW3Byb3BdIHx8IDA7XG4gIHZhciBsZWZ0Q29weSA9IGVsZW0uc3R5bGUubGVmdDtcbiAgdmFyIHJ1bnRpbWVMZWZ0Q29weSA9IGVsZW0ucnVudGltZVN0eWxlLmxlZnQ7XG4gIGVsZW0ucnVudGltZVN0eWxlLmxlZnQgPSBlbGVtLmN1cnJlbnRTdHlsZS5sZWZ0O1xuICBlbGVtLnN0eWxlLmxlZnQgPSAocHJvcCA9PT0gJ2ZvbnRTaXplJykgPyAnMWVtJyA6IHZhbHVlO1xuICB2YWx1ZSA9IGVsZW0uc3R5bGUucGl4ZWxMZWZ0ICsgJ3B4JztcbiAgZWxlbS5zdHlsZS5sZWZ0ID0gbGVmdENvcHk7XG4gIGVsZW0ucnVudGltZVN0eWxlLmxlZnQgPSBydW50aW1lTGVmdENvcHk7XG4gIGVsZW0gPSBudWxsO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIENyb3NzIGJ3b3JzZXIgbWV0aG9kIHRvIGdldCBzdHlsZXNcbmZ1bmN0aW9uIGdldFN0eWxlIChpdGVtLCBwcm9wKVxue1xuICByZXR1cm4gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID8gd2luZG93LmdldENvbXB1dGVkU3R5bGUoaXRlbSwgJycpW3Byb3BdIDogZ2V0SUVDb21wdXRlZFN0eWxlKGl0ZW0sIHByb3ApKTtcbn1cblxuLy8gQ2FsY3VsYXRlIHdpZHRoIG9mIGVsZW1lbnRcbi8vIGlmIGBvdXRlcmAgaXMgZmFsc2UgdGhlbiBwYXJhbXMgbGlrZSBwYWRkaW5nIG9yIGJvcmRlci13aWR0aCBvciBtYXJnaW5cbi8vIHdpbGwgbm90IGFwcGVuZGluZyB0byB3aWR0aFxuZnVuY3Rpb24gX3dpZHRoIChpdGVtLCBvdXRlcilcbntcbiAgaWYgKHR5cGVvZiBvdXRlciA9PT0gJ3VuZGVmaW5lZCcpIG91dGVyID0gdHJ1ZTtcbiAgdmFyIHdpZHRoID0gMDtcbiAgdmFyIHBhcmFtcyA9IFsnd2lkdGgnXTtcbiAgaWYgKG91dGVyKSBwYXJhbXMgPSBwYXJhbXMuY29uY2F0KFsncGFkZGluZ0xlZnQnLCAncGFkZGluZ1JpZ2h0JywgJ2JvcmRlckxlZnRXaWR0aCcsICdib3JkZXJSaWdodFdpZHRoJywgJ21hcmdpblJpZ2h0JywgJ21hcmdpbkxlZnQnXSk7XG4gIHBhcmFtcy5tYXAoZnVuY3Rpb24gKHJ1bGUpIHsgd2lkdGggKz0gcGFyc2VGbG9hdChnZXRTdHlsZShpdGVtLCBydWxlKSk7IH0pO1xuICByZXR1cm4gKGlzTmFOKHdpZHRoKSA/IDAgOiB3aWR0aCk7XG59XG5cbi8vIENhbGN1bGF0ZSB3aWR0aCBvZiBlbGVtZW50XG5mdW5jdGlvbiBfaGVpZ2h0IChpdGVtKVxue1xuICB2YXIgaGVpZ2h0ID0gMDtcbiAgWydoZWlnaHQnLCAncGFkZGluZ1RvcCcsICdwYWRkaW5nQm90dG9tJywgJ2JvcmRlclRvcFdpZHRoJywgJ2JvcmRlckJvdHRvbVdpZHRoJywgJ21hcmdpblRvcCcsICdtYXJnaW5Cb3R0b20nXS5tYXAoZnVuY3Rpb24gKHJ1bGUpIHsgaGVpZ2h0ICs9IHBhcnNlRmxvYXQoZ2V0U3R5bGUoaXRlbSwgcnVsZSkpOyB9KTtcbiAgcmV0dXJuIChpc05hTihoZWlnaHQpID8gMCA6IGhlaWdodCk7XG59XG5cbi8vIENyb3NzIGJyb3dzZXIgbWV0aG9kIHRvIGdldCBvZmZzZXQgb2YgZWxlbWVudFxuZnVuY3Rpb24gX2dldE9mZnNldCAoZWxlbSlcbntcbiAgdmFyIHRvcDtcbiAgdmFyIGxlZnQ7XG4gIGlmIChlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCkge1xuICAgIHZhciBib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICB2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICB2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQ7XG4gICAgdmFyIGNsaWVudFRvcCA9IGRvY0VsZW0uY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDA7XG4gICAgdmFyIGNsaWVudExlZnQgPSBkb2NFbGVtLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDA7XG4gICAgdG9wICA9IGJveC50b3AgKyAgc2Nyb2xsVG9wIC0gY2xpZW50VG9wO1xuICAgIGxlZnQgPSBib3gubGVmdCArIHNjcm9sbExlZnQgLSBjbGllbnRMZWZ0O1xuICAgIHJldHVybiB7IHRvcDogTWF0aC5yb3VuZCh0b3ApLCBsZWZ0OiBNYXRoLnJvdW5kKGxlZnQpIH07XG4gIH1cbiAgZWxzZSB7XG4gICAgdG9wID0gMDtcbiAgICBsZWZ0ID0gMDtcbiAgICB3aGlsZShlbGVtKSB7XG4gICAgICB0b3AgPSB0b3AgKyBwYXJzZUZsb2F0KGVsZW0ub2Zmc2V0VG9wKTtcbiAgICAgIGxlZnQgPSBsZWZ0ICsgcGFyc2VGbG9hdChlbGVtLm9mZnNldExlZnQpO1xuICAgICAgZWxlbSA9IGVsZW0ub2Zmc2V0UGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4ge3RvcDogTWF0aC5yb3VuZCh0b3ApLCBsZWZ0OiBNYXRoLnJvdW5kKGxlZnQpfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgX2ZvckVhY2g6IF9mb3JFYWNoLFxuICBfZm9ySW52RWFjaDogX2ZvckludkVhY2gsXG4gIF93aWR0aDogX3dpZHRoLFxuICBfaGVpZ2h0OiBfaGVpZ2h0LFxuICBfZ2V0T2Zmc2V0OiBfZ2V0T2Zmc2V0LFxuICBfdG9BcnJheTogX3RvQXJyYXksXG4gIF9nZXRTdHlsZTogZ2V0U3R5bGVcbn07XG4iLCJ2YXIgY2hlY2tUb0xpbWl0T2Zmc2V0ID0gcmVxdWlyZSgnLi9jaGVjay10by1saW1pdC1vZmZzZXQnKTtcbnZhciB3b3JrID0gcmVxdWlyZSgnLi93b3JrJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gIG9wdGlvbnMub2Zmc2V0ID0gY2hlY2tUb0xpbWl0T2Zmc2V0KG9wdGlvbnMsIG9wdGlvbnMub2Zmc2V0KTtcbiAgb3B0aW9ucy53cmFwLnN0eWxlLmxlZnQgPSAtIG9wdGlvbnMub2Zmc2V0ICsgJ3B4JztcbiAgd29yayhvcHRpb25zKTtcbn07XG4iLCJ2YXIgX2ZvckVhY2ggPSByZXF1aXJlKCcuL3BvbHknKS5fZm9yRWFjaDtcbnZhciBfZm9ySW52RWFjaCA9IHJlcXVpcmUoJy4vcG9seScpLl9mb3JJbnZFYWNoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBfb2Zmc2V0KVxue1xuICB2YXIgcHJldkl0ZW07XG4gIHZhciB0cmFuc2l0aW9uO1xuXG4gIHZhciBsZWZ0TGltaXQgPSAwO1xuICB2YXIgcmlnaHRMaW1pdCA9IDA7XG4gIHZhciBtYXhTaG93ID0gMTAwO1xuXG4gIG9wdGlvbnMuY3VycmVudExlZnQgPSAwO1xuICBvcHRpb25zLmN1cnJlbnRSaWdodCA9IG9wdGlvbnMud3JhcFdpZHRoO1xuXG4gIF9mb3JFYWNoKG9wdGlvbnMuY2hpbGRzLCBmdW5jdGlvbiAoaXRlbSlcbiAge1xuICAgIGlmIChvcHRpb25zLmN1cnJlbnRMZWZ0IDw9IF9vZmZzZXQgKyBsZWZ0TGltaXQgLSBvcHRpb25zLmxlZnRTbGlkZVRyYW5zaXRpb24pIHtcbiAgICAgIHRyYW5zaXRpb24gPSBfb2Zmc2V0ICsgbGVmdExpbWl0IC0gb3B0aW9ucy5sZWZ0U2xpZGVUcmFuc2l0aW9uO1xuICAgICAgaWYgKF9vZmZzZXQgKyBsZWZ0TGltaXQgKyBpdGVtLnRyYW5zaXRpb24gLSBpdGVtLmRhdGFXaWR0aCAtIG9wdGlvbnMubGVmdFNsaWRlVHJhbnNpdGlvbiA+IG9wdGlvbnMuY3VycmVudExlZnQpIHtcbiAgICAgICAgbGVmdExpbWl0ICs9IGl0ZW0udHJhbnNpdGlvbjtcbiAgICAgIH1cbiAgICAgIGl0ZW0uc3R5bGUubGVmdCA9IHRyYW5zaXRpb24gKyAncHgnO1xuICAgICAgaXRlbS5kYXRhTGVmdCA9IHRyYW5zaXRpb247XG4gICAgICBvcHRpb25zLmN1cnJlbnRMZWZ0ICs9IGl0ZW0uZGF0YVdpZHRoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGl0ZW0uc3R5bGUubGVmdCA9IG9wdGlvbnMuY3VycmVudExlZnQgKyAncHgnO1xuICAgICAgaXRlbS5kYXRhTGVmdCA9IG9wdGlvbnMuY3VycmVudExlZnQ7XG4gICAgICBvcHRpb25zLmN1cnJlbnRMZWZ0ICs9IGl0ZW0uZGF0YVdpZHRoO1xuICAgIH1cblxuICAgIHByZXZJdGVtID0gaXRlbTtcbiAgfSk7XG5cbiAgaWYgKGxlZnRMaW1pdCAtIG9wdGlvbnMubGVmdFNsaWRlVHJhbnNpdGlvbiA+PSBtYXhTaG93IHx8IGxlZnRMaW1pdCAtIG9wdGlvbnMubGVmdFNsaWRlVHJhbnNpdGlvbiA8PSBtYXhTaG93IC0gMzAgJiYgb3B0aW9ucy5sZWZ0U2xpZGVUcmFuc2l0aW9uID4gMCkge1xuICAgIG9wdGlvbnMubGVmdFNsaWRlVHJhbnNpdGlvbiArPSBfb2Zmc2V0IC0gb3B0aW9ucy5wcmV2T2Zmc2V0O1xuICB9XG5cbiAgb3B0aW9ucy5wcmV2T2Zmc2V0ID0gX29mZnNldDtcblxuICB2YXIgbGFzdEluZGV4O1xuICBsZWZ0TGltaXQgPSAwO1xuICBvcHRpb25zLnJpZ2h0U2xpZGVUcmFuc2l0aW9uID0gMDtcblxuICBfZm9ySW52RWFjaChvcHRpb25zLmNoaWxkcywgZnVuY3Rpb24gKGl0ZW0sIGluZGV4KVxuICB7XG4gICAgcHJldkl0ZW0gPSBvcHRpb25zLmNoaWxkc1tpbmRleCAtIDFdO1xuICAgIGlmIChvcHRpb25zLmN1cnJlbnRSaWdodCAtIChpdGVtLmRhdGFXaWR0aCAtIGl0ZW0udHJhbnNpdGlvbikgKyBsZWZ0TGltaXQgPiBvcHRpb25zLmVsZW1lbnRXaWR0aCArIF9vZmZzZXQgJiYgb3B0aW9ucy5jdXJyZW50UmlnaHQgLSAoaXRlbS5kYXRhV2lkdGgpID4gb3B0aW9ucy5lbGVtZW50V2lkdGggKyBfb2Zmc2V0IC0gbWF4U2hvdykge1xuICAgICAgbGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICB0cmFuc2l0aW9uID0gb3B0aW9ucy5jdXJyZW50UmlnaHQgLSBpdGVtLmRhdGFXaWR0aCAtIGl0ZW0udHJhbnNpdGlvbiArIHJpZ2h0TGltaXQ7XG4gICAgICBpdGVtLmRhdGFMZWZ0ID0gdHJhbnNpdGlvbjtcbiAgICAgIGl0ZW0uc3R5bGUubGVmdCA9IHRyYW5zaXRpb24gKyAncHgnO1xuICAgICAgcmlnaHRMaW1pdCArPSBwcmV2SXRlbS5kYXRhV2lkdGggLSBwcmV2SXRlbS50cmFuc2l0aW9uO1xuICAgICAgbGVmdExpbWl0ICs9IGl0ZW0udHJhbnNpdGlvbjtcbiAgICB9XG4gICAgb3B0aW9ucy5jdXJyZW50UmlnaHQgLT0gcGFyc2VGbG9hdChpdGVtLmRhdGFXaWR0aCk7XG4gIH0pO1xuICBpZiAobGVmdExpbWl0ID4gbWF4U2hvdykge1xuICAgIG9wdGlvbnMucmlnaHRTbGlkZVRyYW5zaXRpb24gPSBsZWZ0TGltaXQgLSBtYXhTaG93O1xuICB9XG5cbiAgcmlnaHRMaW1pdCA9IDA7XG5cbiAgX2ZvckVhY2gob3B0aW9ucy5jaGlsZHMsIGZ1bmN0aW9uIChpdGVtLCBpbmRleClcbiAge1xuICAgIGlmIChpbmRleCA8IGxhc3RJbmRleCkgcmV0dXJuIDtcbiAgICBpZiAoIW9wdGlvbnMuY2hpbGRzW2xhc3RJbmRleCAtIDFdIHx8ICFpdGVtLmRhdGFMZWZ0KSByZXR1cm4gO1xuICAgIGlmIChpbmRleCA9PT0gbGFzdEluZGV4KSB7XG4gICAgICB0cmFuc2l0aW9uID0gTWF0aC5tYXgob3B0aW9ucy5lbGVtZW50V2lkdGggKyBfb2Zmc2V0IC0gbGVmdExpbWl0ICsgb3B0aW9ucy5yaWdodFNsaWRlVHJhbnNpdGlvbiwgb3B0aW9ucy5jaGlsZHNbbGFzdEluZGV4IC0gMV0uZGF0YUxlZnQgKyBvcHRpb25zLmNoaWxkc1tsYXN0SW5kZXggLSAxXS50cmFuc2l0aW9uKTtcbiAgICAgIGl0ZW0uc3R5bGUubGVmdCA9IHRyYW5zaXRpb24gKyAncHgnO1xuICAgICAgcmlnaHRMaW1pdCArPSAodHJhbnNpdGlvbiAtIG9wdGlvbnMuY2hpbGRzW2xhc3RJbmRleCAtIDFdLmRhdGFMZWZ0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0cmFuc2l0aW9uID0gaXRlbS5kYXRhTGVmdCAtIChpdGVtLmRhdGFMZWZ0IC0gb3B0aW9ucy5jaGlsZHNbbGFzdEluZGV4IC0gMV0uZGF0YUxlZnQgLSBvcHRpb25zLmNoaWxkc1tsYXN0SW5kZXggLSAxXS50cmFuc2l0aW9uKSArIHJpZ2h0TGltaXQ7XG4gICAgICBpdGVtLnN0eWxlLmxlZnQgPSB0cmFuc2l0aW9uICsgJ3B4JztcbiAgICAgIHJpZ2h0TGltaXQgKz0gaXRlbS50cmFuc2l0aW9uO1xuICAgIH1cbiAgfSk7XG59O1xuIiwidmFyIHNsaWRlID0gcmVxdWlyZSgnLi9zbGlkZScpO1xudmFyIGFuaW1hdGlvbiA9IHJlcXVpcmUoJy4vYW5pbWF0aW9uJyk7XG52YXIgT3V0Q3ViaWMgPSByZXF1aXJlKCcuL2Vhc2UnKS5PdXRDdWJpYztcbnZhciBfZm9yRWFjaCA9IHJlcXVpcmUoJy4vcG9seScpLl9mb3JFYWNoO1xudmFyIGNhY2hlZEVsZW1lbnRzID0gcmVxdWlyZSgnLi9jYWNoZWQtZWxlbWVudHMnKTtcbnZhciBvcHRzO1xudmFyIHRvdWNoU3RhcnQgPSBmdW5jdGlvbiAoZSlcbntcbiAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICBvcHRzLnRvdWNoLnN0YXJ0Q29vcmQgPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gIG9wdHMudG91Y2guY3VycmVudENvb3JkID0gb3B0cy50b3VjaC5zdGFydENvb3JkO1xuICBvcHRzLnRvdWNoLmNvb3JkcyA9IFtvcHRzLnRvdWNoLnN0YXJ0Q29vcmRdO1xuICBvcHRzLnRvdWNoLnRpbWVzdGFtcHMgPSBbZS50aW1lU3RhbXBdO1xuICBvcHRzLnRvdWNoLnNsaWRpbmcgPSB0cnVlO1xufTtcblxuZnVuY3Rpb24gYmluZEV2ZW50cyhvcHRpb25zKVxue1xuICBvcHRzID0gb3B0aW9ucztcbiAgb3B0cy50b3VjaCA9IHt9O1xuICBvcHRzLnRvdWNoLnN0YXJ0Q29vcmQ7XG4gIG9wdHMudG91Y2guY3VycmVudENvb3JkO1xuICBvcHRzLnRvdWNoLnNsaWRpbmcgPSBmYWxzZTtcbiAgb3B0cy50b3VjaC5jb29yZHMgPSBbXTtcbiAgb3B0cy50b3VjaC50aW1lc3RhbXBzID0gW107XG4gIG9wdHMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hTdGFydCk7XG59XG5mdW5jdGlvbiB1bmJpbmRFdmVudHMob3B0aW9ucylcbntcbiAgb3B0aW9ucy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaFN0YXJ0KTtcbn1cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGUpXG57XG4gIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgX2ZvckVhY2goY2FjaGVkRWxlbWVudHMoKSwgZnVuY3Rpb24gKG9wdGlvbnMpXG4gIHtcbiAgICBpZiAob3B0aW9ucy50b3VjaC5zbGlkaW5nKSB7XG4gICAgICBvcHRpb25zLm9mZnNldCAtPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBvcHRpb25zLnRvdWNoLmN1cnJlbnRDb29yZDtcbiAgICAgIG9wdGlvbnMudG91Y2guY3VycmVudENvb3JkID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc2xpZGUob3B0aW9ucyk7XG4gICAgICBvcHRpb25zLnRvdWNoLmNvb3Jkcy5wdXNoKG9wdGlvbnMudG91Y2guY3VycmVudENvb3JkKTtcbiAgICAgIG9wdGlvbnMudG91Y2gudGltZXN0YW1wcy5wdXNoKGUudGltZVN0YW1wKTtcbiAgICAgIGlmIChvcHRpb25zLnRvdWNoLmNvb3Jkcy5sZW5ndGggPiA0KSB7XG4gICAgICAgIG9wdGlvbnMudG91Y2guY29vcmRzLnNoaWZ0KCk7XG4gICAgICAgIG9wdGlvbnMudG91Y2gudGltZXN0YW1wcy5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoZSlcbntcbiAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICBfZm9yRWFjaChjYWNoZWRFbGVtZW50cygpLCBmdW5jdGlvbiAob3B0aW9ucylcbiAge1xuICAgIGlmIChvcHRpb25zLnRvdWNoLnNsaWRpbmcpIHtcbiAgICAgIGFuaW1hdGlvbihvcHRpb25zLm9mZnNldCwgb3B0aW9ucy5vZmZzZXQgLSAob3B0aW9ucy50b3VjaC5jb29yZHNbb3B0aW9ucy50b3VjaC5jb29yZHMubGVuZ3RoIC0gMV0gLSBvcHRpb25zLnRvdWNoLmNvb3Jkc1swXSkgKiAyLCAob3B0aW9ucy50b3VjaC50aW1lc3RhbXBzW29wdGlvbnMudG91Y2gudGltZXN0YW1wcy5sZW5ndGggLSAxXSAtIG9wdGlvbnMudG91Y2gudGltZXN0YW1wc1tvcHRpb25zLnRvdWNoLnRpbWVzdGFtcHMubGVuZ3RoIC0gMl0pICogNDAsIE91dEN1YmljLCBmdW5jdGlvbiAodmFsdWUpXG4gICAgICB7XG4gICAgICAgIG9wdGlvbnMub2Zmc2V0ID0gdmFsdWU7XG4gICAgICAgIHNsaWRlKG9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgICBvcHRpb25zLnRvdWNoLnNsaWRpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbi8vIHNsaWRlIGJ5IHRvdWNoIGV2ZW50XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZEV2ZW50cyxcbiAgdW5iaW5kOiB1bmJpbmRFdmVudHNcbn07XG4iLCJ2YXIgdGFiZmxvdyA9IHJlcXVpcmUoJy4vdGFiZmxvdycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBfb2Zmc2V0KVxue1xuICB2YXIgaTtcbiAgaWYgKCFfb2Zmc2V0KSBfb2Zmc2V0ID0gb3B0aW9ucy5vZmZzZXQ7XG4gIGlmIChfb2Zmc2V0IC0gb3B0aW9ucy5wcmV2T2Zmc2V0IDwgLTIpIHtcbiAgICBmb3IgKGkgPSBvcHRpb25zLnByZXZPZmZzZXQ7IGkgPiBfb2Zmc2V0OyBpIC09IDEpIHtcbiAgICAgIHRhYmZsb3cob3B0aW9ucywgaSk7XG4gICAgfVxuICAgIHRhYmZsb3cob3B0aW9ucywgX29mZnNldCk7XG4gIH1cbiAgZWxzZSBpZiAoX29mZnNldCAtIG9wdGlvbnMucHJldk9mZnNldCA+IDIpIHtcbiAgICBmb3IgKGkgPSBvcHRpb25zLnByZXZPZmZzZXQ7IGkgPCBfb2Zmc2V0OyBpICs9IDEpIHtcbiAgICAgIHRhYmZsb3cob3B0aW9ucywgaSk7XG4gICAgfVxuICAgIHRhYmZsb3cob3B0aW9ucywgX29mZnNldCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGFiZmxvdyhvcHRpb25zLCBfb2Zmc2V0KTtcbiAgfVxufTtcbiJdfQ==
