/* global define */
/* global module */
(function (factory)
{
  if ( typeof module === 'object' && typeof module.exports === 'object' ) {
    module.exports = factory();
  }
  else if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['tabflow'], factory);
  }
  else {
    // Browser globals:
    window.tabflow = factory();
  }
})(function ()
{
  var FRAMES_PER_SECOND = 50;

  function _forEach (elements, cb)
  {
    var i, len;
    for (i = 0, len = elements.length; i < len; i = i + 1) {
      if (cb(elements[i], i) === false) {
        break;
      }
    }
  }

  function _forInvEach (elements, cb)
  {
    var i;
    for (i = elements.length - 1; i > -1; i = i - 1) {
      if (cb(elements[i], i) === false) {
        break;
      }
    }
  }

  function _toArray (elements)
  {
    var res = [];
    var i, len;
    for (i = 0, len = elements.length; i < len; i = i + 1)
      if (elements[i].nodeType === 1)
        res.push(elements[i]);
    return res;
  }

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

  function getStyle (item, prop)
  {
    return (window.getComputedStyle ? window.getComputedStyle(item, '')[prop] : getIEComputedStyle(item, prop));
  }

  function _width (item, outer)
  {
    if (typeof outer === 'undefined') outer = true;
    var width = 0;
    var params = ['width'];
    if (outer) params = params.concat(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'marginRight', 'marginLeft']);
    params.map(function (rule) { width += parseFloat(getStyle(item, rule)); });
    return (isNaN(width) ? 0 : width);
  }

  function _height (item)
  {
    var height = 0;
    ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'marginTop', 'marginBottom'].map(function (rule) { height += parseFloat(getStyle(item, rule)); });
    return (isNaN(height) ? 0 : height);
  }

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

  function InOut (k)
  {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
    return - 0.5 * ( --k * ( k - 2 ) - 1 );
  }

  function outCubic (p) {
    return (Math.pow((p - 1), 3) + 1);
  }

  function disableSelection (target)
  {
    target.setAttribute('unselectable', 'on');
    target.style.userSelect = 'none';
    target.style.WebkitUserSelect = 'none';
    target.addEventListener('selectstart', function (e)
    {
      e.preventDefault();
    });
  }

  function _work (options, _offset)
  {
    var i;
    if (!_offset) _offset = options.offset;
    if (_offset - options.prevOffset < -2) {
      for (i = options.prevOffset; i > _offset; i -= 1) {
        doSlide(options, i);
      }
      doSlide(options, _offset);
    }
    else if (_offset - options.prevOffset > 2) {
      for (i = options.prevOffset; i < _offset; i += 1) {
        doSlide(options, i);
      }
      doSlide(options, _offset);
    }
    else {
      doSlide(options, _offset);
    }
  }

  function doSlide (options, _offset)
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
  }

  function checkToLimitOffset (options, value)
  {
    if (value > options.wrapWidth - options.elementWidth) {
      value = options.wrapWidth - options.elementWidth;
    }
    if (value < 0) {
      value = 0;
    }
    return value;
  }

  function slide (options)
  {
    options.offset = checkToLimitOffset(options, options.offset);
    options.wrap.style.left = - options.offset + 'px';
    _work(options);
  }

  var lastTimeout = 0;

  function bindTimeout (currValue, millSecsPerFrame, cb, value)
  {
    setTimeout(function () {
      if (typeof cb === 'function')  {
        cb(value);
      }
    }, lastTimeout + millSecsPerFrame);
  }

  function animation (fromValue, toValue, millsecs, ease, cb)
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
  }

  var lowestDelta;

  function shouldAdjustOldDeltas (orgEvent, absDelta)
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

  function mouseWheelHandler (e, options)
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

  var elements = document.querySelectorAll('[data-tabs]');

  var cachedElements = [];

  _forEach(elements, create);

  function create (element, defaultOffset)
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

    options.rightElement.addEventListener('click', function (e)
    {
      animation(options.offset, checkToLimitOffset(options, options.offset + parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
      {
        options.offset = value;
        slide(options);
      });
      e.preventDefault();
      e.stopPropagation();
    });

    options.leftElement.addEventListener('click', function (e)
    {
      animation(options.offset, checkToLimitOffset(options, options.offset - parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
      {
        options.offset = value;
        slide(options);
      });
      e.preventDefault();
      e.stopPropagation();
    });

    cachedElements.push(options);

    // slide by touch event
    (function ()
    {
      var startCoord;
      var currentCoord;
      var sliding = false;
      var coords = [];
      var timestamps = [];
      element.addEventListener('touchstart', function (e)
      {
        e = e || window.event;
        startCoord = e.touches[0].pageX;
        currentCoord = startCoord;
        coords = [startCoord];
        timestamps = [e.timeStamp];
        sliding = true;
      });
      document.body.addEventListener('touchmove', function (e)
      {
        e = e || window.event;
        if (sliding) {
          options.offset -= e.touches[0].pageX - currentCoord;
          currentCoord = e.touches[0].pageX;
          slide(options);
          coords.push(currentCoord);
          timestamps.push(e.timeStamp);
          if (coords.length > 4) {
            coords.shift();
            timestamps.shift();
          }
        }
      });
      document.body.addEventListener('touchend', function (e)
      {
        e = e || window.event;
        if (sliding) {
          animation(options.offset, options.offset - (coords[coords.length - 1] - coords[0]) * 2, (timestamps[timestamps.length - 1] - timestamps[timestamps.length - 2]) * 40, outCubic, function (value)
          {
            options.offset = value;
            slide(options);
          });
          sliding = false;
        }
      });
    })();

    function handler (e)
    {
      mouseWheelHandler(e, options);
    }

    var toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    for (var i = toBind.length; i;) {
      i -= 1;
      options.wrap.addEventListener(toBind[i], handler, false);
      options.leftElement.addEventListener(toBind[i], handler, false);
      options.rightElement.addEventListener(toBind[i], handler, false);
    }
    options.wrap.mousewheelLineHeight = parseInt(getStyle(element, 'fontSize'), 10);
    options.wrap.mousewheelPageHeight = _height(options.wrap);
    options.leftElement.mousewheelLineHeight = parseInt(getStyle(options.wrap, 'fontSize'), 10);
    options.leftElement.mousewheelPageHeight = _height(options.leftElement);
    options.rightElement.mousewheelLineHeight = parseInt(getStyle(options.wrap, 'fontSize'), 10);
    options.rightElement.mousewheelPageHeight = _height(options.rightElement);

    _work(options);

    options.offset = defaultOffset;
    slide(options);

    disableSelection(document.body);
  }


  window.addEventListener('resize', function ()
  {
    _forEach(cachedElements, function (options)
    {
      options.elementWidth = _width(options.element, false);
      slide(options);
    });
  });

  function slideWidthElement (element, offset)
  {
    _forEach(cachedElements, function (options)
    {
      if (options.element === element) {
        options.offset = offset;
        slide(options);
      }
    });
  }

  function animationSlideWithElement (element, offset)
  {
    _forEach(cachedElements, function (options)
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

  function destroyByElement (element)
  {
    _forEach(cachedElements, function (options, index)
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
        cachedElements.splice(index, 1);
      }
    });
  }

  return {
    create: create,
    slide: slideWidthElement,
    animate: animationSlideWithElement,
    destroy: destroyByElement
  };

});
