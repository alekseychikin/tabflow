(function ()
{
  var _forEach = function (elements, cb)
  {
    var i, len;
    for (i = 0, len = elements.length; i < len; i = i + 1) {
      if (cb(elements[i], i) === false) {
        break;
      }
    }
  };
  var _forInvEach = function (elements, cb)
  {
    var i;
    for (i = elements.length - 1; i > -1; i = i - 1) {
      if (cb(elements[i], i) === false) {
        break;
      }
    }
  };
  var _toArray = function (elements)
  {
    var res = [];
    var i, len;
    for (i = 0, len = elements.length; i < len; i = i + 1)
      if (elements[i].nodeType === 1)
        res.push(elements[i]);
    return res;
  };
  var getIEComputedStyle = function (elem, prop)
  {
    var value = elem.currentStyle[prop] || 0;
    var leftCopy = elem.style.left;
    var runtimeLeftCopy = elem.runtimeStyle.left;
    elem.runtimeStyle.left = elem.currentStyle.left;
    elem.style.left = (prop === "fontSize") ? "1em" : value;
    value = elem.style.pixelLeft + "px";
    elem.style.left = leftCopy;
    elem.runtimeStyle.left = runtimeLeftCopy;
    elem = null;
    return value;
  };
  var getStyle = function (item, prop)
  {
    return (window.getComputedStyle ? window.getComputedStyle(item, '')[prop] : getIEComputedStyle(item, prop));
  };
  var _width = function (item, outer)
  {
    if (typeof outer === 'undefined') outer = true;
    var width = 0;
    var params = ['width'];
    if (outer) params = params.concat(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'marginRight', 'marginLeft']);
    params.map(function (rule) { width += parseFloat(getStyle(item, rule)); });
    return (isNaN(width) ? 0 : width);
  };
  var _height = function (item)
  {
    var height = 0;
    ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'marginTop', 'marginBottom'].map(function (rule) { height += parseFloat(getStyle(item, rule)); });
    return (isNaN(height) ? 0 : height);
  };
  var _getOffset = function (elem)
  {
    if (elem.getBoundingClientRect) {
      var box = elem.getBoundingClientRect();
      var body = document.body;
      var docElem = document.documentElement;
      var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
      var clientTop = docElem.clientTop || body.clientTop || 0;
      var clientLeft = docElem.clientLeft || body.clientLeft || 0;
      var top  = box.top +  scrollTop - clientTop;
      var left = box.left + scrollLeft - clientLeft;
      return { top: Math.round(top), left: Math.round(left) }
    }
    else {
      var top = 0;
      var left = 0;
      while(elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent
      }
      return {top: Math.round(top), left: Math.round(left)}
    }
  };

  var InOut = function ( k )
  {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
    return - 0.5 * ( --k * ( k - 2 ) - 1 );
  }


  var elements = document.querySelectorAll('[data-tabs]');

  _forEach(elements, function (element)
  {
    var childs = _toArray(element.childNodes);
    var wrap = document.createElement('div');
    var wrapWidth = 0;
    var elementHeight = _height(element);
    var elementWidth = _width(element, false);
    var rightElement = document.createElement('span');
    var leftElement = document.createElement('span');
    var elementHeight = 0;
    var logs = document.getElementsByClassName('logs')[0];
    var logElement;
    _forEach(childs, function (item)
    {
      wrapWidth += _width(item);
      elementHeight = Math.max(elementHeight, _height(item));
      wrap.appendChild(item);
      logElement = document.createElement('div');
      logElement.className = 'log';
      logs.appendChild(logElement);
    });
    logs = logs.getElementsByClassName('log');
    element.appendChild(wrap);
    wrap.style.width = Math.ceil(wrapWidth) + 'px';
    element.style.position = 'relative';
    // element.style.overflow = 'hidden';
    element.style.height = elementHeight + 'px';
    wrap.style.height = elementHeight + 'px';
    wrap.style.position = 'relative';
    // wrap.style.marginLeft = '-100px';

    var rightMargin = 100;
    var leftMargin = 100;
    var rightBorder = elementWidth - rightMargin;
    var leftBorder = leftMargin;
    var _transition = 30;

    element.appendChild(leftElement);
    leftElement.style.position = 'absolute';
    leftElement.style.top = 0;
    leftElement.style.left = 0;
    leftElement.style.height = elementHeight + 'px';
    leftElement.style.width = '100px';
    leftElement.style.zIndex = 1;

    element.appendChild(rightElement);
    rightElement.style.position = 'absolute';
    rightElement.style.top = 0;
    rightElement.style.right = 0;
    rightElement.style.height = elementHeight + 'px';
    rightElement.style.width = '100px';
    rightElement.style.zIndex = 1;

    _forEach(childs, function (item)
    {
      item.dataLeft = _getOffset(item).left;
      item.dataWidth = _width(item, true);
      item.dataLastLeft = 0;
      item.isShort = item.dataWidth <= _transition;
      item.transition = item.isShort ? item.dataWidth - item.dataWidth / 3 : _transition;
      item.showLine = false;
    });

    _forEach(childs, function (item, index)
    {
      item.style.width = _width(item, false) + 'px';
      item.style.position = 'absolute';
      item.style.left = item.dataLeft + 'px';
      // item.style.top = index * 2 + 'px';
    });

//#####################

    var verticalCurrentLeft = document.getElementsByClassName('vertical-current-left')[0];
    var tabsScroll = document.getElementsByClassName('tabs__scroll')[0];
    var notSoFast;
    var offset = 0;
    var prevOffset = 0;
    var currentLeft = 0;
    var currentRight = wrapWidth;

    var leftSlide = false;
    var leftSlideTransition = 0;
    var rightSlideTransition = 0;
    var leftSlideOffset = 0;

    var makeLog = function (index)
    {
      var text = '';
      for (var i = 1; i < arguments.length; i++) {
        text += arguments[i] + '&nbsp;&nbsp;';
      }
      logs[index].innerHTML = text;
    }
    var rightline = document.getElementsByClassName('vertical-line')[0];

    var _work = function ()
    {
      if (!notSoFast) {
        // notSoFast = setTimeout(function ()
        // {
          // notSoFast = false;
          var prevItem;
          var count = 5;
          var minWidth = 70;
          var transition;

          var beginIndex = 1;
          var firstEntire = false;

          var leftLimit = 0;
          var rightLimit = 0;
          var maxShow = 100;

          currentLeft = 0;
          currentRight = wrapWidth;

          _forEach(childs, function (item, index)
          {
            if (currentLeft <= offset + leftLimit - leftSlideTransition) {
              transition = offset + leftLimit - leftSlideTransition;
              if (offset + leftLimit + item.transition - item.dataWidth - leftSlideTransition > currentLeft) {
                leftLimit += item.transition;
              }
              item.style.left = transition + 'px';
              item.dataLeft = transition;
              item.className = 'tabs__item';
              currentLeft += item.dataWidth;
            }
            else {
              item.style.left = currentLeft + 'px';
              item.dataLeft = currentLeft;
              item.className = 'tabs__item';
              currentLeft += item.dataWidth;
            }

            prevItem = item;
          });

          if (leftLimit - leftSlideTransition >= maxShow || leftLimit - leftSlideTransition <= maxShow - 30 && leftSlideTransition > 0) {
            leftSlideTransition += offset - prevOffset;
          }

          prevOffset = offset;

          // rightline.style.left = elementWidth + offset - leftLimit + 'px';

          var lastIndex;
          leftLimit = 0;
          rightSlideTransition = 0;

          _forInvEach(childs, function (item, index)
          {
            prevItem = childs[index - 1];
            if (currentRight - (item.dataWidth - item.transition) + leftLimit > elementWidth + offset && currentRight - (item.dataWidth) > elementWidth + offset - maxShow) {
              lastIndex = index;
              transition = currentRight - item.dataWidth - item.transition + rightLimit;
              item.dataLeft = transition;
              item.style.left = transition + 'px';
              rightLimit += prevItem.dataWidth - prevItem.transition;
              leftLimit += item.transition;
              // item.className = 'tabs__item tabs__item--blue';
            }
            currentRight -= parseFloat(item.dataWidth);
          });
          if (leftLimit > maxShow) {
            rightSlideTransition = leftLimit - maxShow;
          }

          rightLimit = 0;

          _forEach(childs, function (item, index)
          {
            if (index < lastIndex) return ;
            if (!childs[lastIndex - 1] || !item.dataLeft) return ;
            if (index == lastIndex) {
              transition = Math.max(elementWidth + offset - leftLimit + rightSlideTransition, childs[lastIndex - 1].dataLeft + childs[lastIndex - 1].transition);
              item.style.left = transition + 'px';
              rightLimit += (transition - childs[lastIndex - 1].dataLeft);
            }
            else {
              transition = item.dataLeft - (item.dataLeft - childs[lastIndex - 1].dataLeft - childs[lastIndex - 1].transition) + rightLimit;
              item.style.left = transition + 'px';
              rightLimit += item.transition;
            }
          });

        // }, 100);
      }
    };

//#####################

    (function ()
    {
      var startLeft = 0;
      var startBorderLeft;
      var isMoving = false;
      var wrapLeft = 0;
      var startOffset = 0;
      tabsScroll.addEventListener('mousedown', function (e)
      {
        startLeft = e.screenX;
        startPositionLeft = parseInt(getComputedStyle(this, '')['left'], 10);
        wrapLeft = parseInt(getComputedStyle(wrap, '')['left'], 10) || 0;
        startOffset = - offset;
        isMoving = true;
      });
      document.addEventListener('mousemove', function (e)
      {
        if (isMoving) {
          tabsScroll.style.left = startPositionLeft + e.screenX - startLeft + 'px';
          var limit = 202;
          var val = wrapLeft + e.screenX - startLeft;
          if (val > 0) {
            val = 0;
          }
          if (-val > wrapWidth - elementWidth) {
            val = - wrapWidth + elementWidth;
          }
          wrap.style.left = val + 'px';
          offset = - startOffset - val + wrapLeft;
          _work();
        }
      });
      document.addEventListener('mouseup', function ()
      {
        isMoving = false;
      });
    })();

    rightElement.addEventListener('click', function (e)
    {
      offset += parseInt(elementWidth * 0.7, 10);
      if (offset > wrapWidth - elementWidth) {
        offset = wrapWidth - elementWidth;
      }
      wrap.style.left = '-' + offset + 'px';
      _work();
      e.preventDefault();
      e.stopPropagation();
    });

    _work();
    window.addEventListener('resize', function ()
    {
      var newWidth = _width(element);
      rightBorder -= elementWidth - newWidth;
      elementWidth = newWidth;
      _work();
    });

    function disableSelection(target)
    {
      target.setAttribute('unselectable', 'on');
      target.style.userSelect = 'none';
      target.style.WebkitUserSelect = 'none';
      target.addEventListener('selectstart', function (e)
      {
        e.preventDefault();
      });
    }

    disableSelection(document.body);

    (function ()
    {
      var startLeft = 0;
      var startBorderRight;
      var isMoving = false;
      rightline.addEventListener('mousedown', function (e)
      {
        startLeft = e.screenX;
        startBorderRight = rightBorder;
        isMoving = true;
      });
      document.addEventListener('mousemove', function (e)
      {
        if (isMoving) {
          rightBorder = startBorderRight + e.screenX - startLeft;
          rightline.style.right = elementWidth - rightBorder + 'px';
          _work();
        }
      });
      document.addEventListener('mouseup', function ()
      {
        isMoving = false;
      });
    })();

    (function ()
    {
      var startLeft = 0;
      var startBorderLeft;
      var isMoving = false;
      var rightline = document.getElementsByClassName('vertical-line2')[0];
      rightline.addEventListener('mousedown', function (e)
      {
        startLeft = e.screenX;
        startBorderLeft = leftBorder;
        isMoving = true;
      });
      document.addEventListener('mousemove', function (e)
      {
        if (isMoving) {
          leftBorder = startBorderLeft + e.screenX - startLeft;
          rightline.style.left = leftBorder + 'px';
          _work();
        }
      });
      document.addEventListener('mouseup', function ()
      {
        isMoving = false;
      });
    })();

    _forEach(childs, function (item)
    {
      item.addEventListener('mouseover', function ()
      {
        this.showLine = true;
        _work();
      });
      item.addEventListener('mouseout', function ()
      {
        this.showLine = false;
        _work();
      });
    });

  });
})();
