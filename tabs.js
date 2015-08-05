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
    width += parseFloat(getStyle(item, 'width'));
    if (outer) {
      width += parseInt(getStyle(item, 'paddingLeft'), 10);
      width += parseInt(getStyle(item, 'paddingRight'), 10);
      width += parseInt(getStyle(item, 'borderLeftWidth'), 10);
      width += parseInt(getStyle(item, 'borderRightWidth'), 10);
      width += parseInt(getStyle(item, 'marginRight'), 10);
      width += parseInt(getStyle(item, 'marginLeft'), 10);
    }
    return (isNaN(width) ? 0 : width);
  };
  var _height = function (item)
  {
    var height = 0;
    height += parseFloat(getStyle(item, 'height'));
    height += parseInt(getStyle(item, 'paddingTop'), 10);
    height += parseInt(getStyle(item, 'paddingBottom'), 10);
    height += parseInt(getStyle(item, 'borderTopWidth'), 10);
    height += parseInt(getStyle(item, 'borderBottomWidth'), 10);
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

  var elements = document.querySelectorAll('[data-tabs]');
  _forEach(elements, function (element)
  {
    var childs = _toArray(element.childNodes);
    var wrap = document.createElement('div');
    var wrapWidth = 0;
    var leftIdent = 0;
    var elementHeight = _height(element);
    var elementWidth = _width(element);
    var rightElement = document.createElement('span');
    var leftElement = document.createElement('span');
    var elementHeight = 0;
    _forEach(childs, function (item)
    {
      wrapWidth += _width(item);
      elementHeight = Math.max(elementHeight, _height(item));
      wrap.appendChild(item);
    });
    element.appendChild(wrap);
    wrap.style.width = Math.ceil(wrapWidth) + 'px';
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.style.height = elementHeight + 'px';
    wrap.style.height = elementHeight + 'px';
    wrap.style.position = 'relative';

    var rightMargin = 100;
    var leftMargin = 300;
    var rightBorder = elementWidth - rightMargin;
    var leftBorder = leftMargin;

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
      item.showLine = false;
    });

    _forEach(childs, function (item)
    {
      item.style.position = 'absolute';
      item.style.left = item.dataLeft + 'px';
      item.style.width = _width(item, false) + 'px';
    });

    var _log = function (a, b)
    {
      return Math.log(b) / Math.log(a);
    };

    var powCoeff = 5;
    var startValue = 0;
    var diffValue = 300;
    var getRightIdent = function (value)
    {
      return _log(powCoeff, (((value - startValue) * (powCoeff - 1) / diffValue) + 1));
    };

    window.getRightIdent = getRightIdent;

    // console.log(wrapWidth, rightBorder, wrapWidth - rightBorder);

    var coeff = getRightIdent(wrapWidth - rightBorder) / 2.5;
    //          ↑↑↑    возвращает от 0 до 1    ↑↑↑ ← приводим до единицы
    // console.log('coeff', coeff);

    var verticalCurrentLeft = document.getElementsByClassName('vertical-current-left')[0];

//#####################

    var notSoFast;
    var _work = function ()
    {
      if (!notSoFast) {
        // notSoFast = setTimeout(function ()
        // {
          // notSoFast = false;
          var currentLeft = 0;
          var currentRight = 0;
          var _left;
          var prevItem;
          var count = 5;
          var _transition = 50;
          var minWidth = 70;
          var transition;
          // var rightBorder = elementWidth * 1.5 / 2;

          var beginIndex = 1;
          var firstEntire = false;

          var childsLength = childs.length;
          _forInvEach(childs, function (item, index)
          {
            if (index == childs.length - 1) {
              prevItem = item;
              currentRight = item.dataLeft;
              return ;
            }

            if (item.showLine) {
              verticalCurrentLeft.style.left = currentRight + 'px';
            }
            if (item.dataWidth > _transition &&
              currentRight - item.dataWidth + 25 > leftBorder &&
              currentRight - item.dataWidth - _transition + 3 < leftBorder
            ) {
              transition = currentRight - item.dataWidth - ((currentRight - item.dataWidth - leftBorder - _transition) / 3);
              item.style.left = transition + 'px';
              item.className = 'tabs__item tabs__item--yellow';
              currentRight = transition;
              if (!firstEntire) {
                firstEntire = true;
                beginIndex = index;
                currentLeft -= item.dataWidth;
              }
            }
            else if (item.dataWidth < _transition &&
              currentRight - item.dataWidth + 6 > leftBorder &&
              currentRight - item.dataWidth - _transition < leftBorder
            ) {
              transition = currentRight - item.dataWidth - ((currentRight - item.dataWidth - leftBorder - _transition) / 8);
              item.style.left = transition + 'px';
              item.className = 'tabs__item tabs__item--pink';
              currentRight = transition;
              if (!firstEntire) {
                firstEntire = true;
                beginIndex = index;
                currentLeft -= item.dataWidth;
              }
            }
            else if (item.dataWidth < _transition &&
              currentRight - item.dataWidth < leftBorder &&
              currentRight > leftBorder
            ) {
              currentRight -= item.dataWidth + ((currentRight - item.dataWidth - leftBorder - _transition) / 8);
              if (!firstEntire) {
                beginIndex = index;
                currentLeft = currentRight;
              }
              item.style.left = currentRight + 'px';
              item.className = 'tabs__item tabs__item--red';
            }
            else if (item.dataWidth > _transition && currentRight - item.dataWidth < leftBorder) {
              currentRight = Math.min(currentRight - _transition, leftBorder);
              item.style.left = currentRight + 'px';
              item.className = 'tabs__item tabs__item--blue';
              if (!firstEntire) {
                firstEntire = true;
                beginIndex = index;
                currentLeft -= item.dataWidth;
              }
            }
            else if (item.dataWidth < _transition &&
              currentRight - 2 < leftBorder
            ) {
              currentRight -= item.dataWidth - 10;
              item.style.left = currentRight + 'px';
              item.className = 'tabs__item tabs__item--blue';
              if (!firstEntire) {
                firstEntire = true;
                beginIndex = index;
                currentLeft -= item.dataWidth;
              }
            }
            else {
              currentRight -= item.dataWidth;
              if (!firstEntire) {
                beginIndex = index;
                currentLeft = currentRight;
              }
              item.style.left = currentRight + 'px';
              item.className = 'tabs__item tabs__item--green';
            }
            prevItem = item;
          });

          // console.log('beginIndex', beginIndex);
          // console.log('currentLeft', currentLeft);

          _forEach(childs, function (item, index)
          {
            // return false;
            if (index < beginIndex) {
              return ;
            }
            else if (index == beginIndex) {
              prevItem = item;
              return ;
            }
            if (!prevItem) {
              prevItem = item;
              return ;
            }

            if (prevItem.dataWidth > minWidth && currentLeft + prevItem.dataWidth > rightBorder) {
              if (currentLeft + prevItem.dataWidth + 10 >= rightBorder &&
                currentLeft + prevItem.dataWidth - (_transition / 2) < rightBorder
              ) {
                item.style.left = currentLeft + prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 3) + 'px'
                item.className = 'tabs__item tabs__item--red';
                currentLeft += prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 3);
              }
              else {
                transition = Math.max(currentLeft + _transition, rightBorder);
                item.style.left = transition + 'px';
                item.className = 'tabs__item tabs__item--blue';
                currentLeft = transition;
              }
            }
            else if (prevItem.dataWidth > minWidth &&
              currentLeft + prevItem.dataWidth - 1 <= rightBorder &&
              currentLeft + prevItem.dataWidth + _transition > rightBorder
            ) {
              item.style.left = currentLeft + prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 3) + 'px'
              currentLeft += prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 3);
              item.className = 'tabs__item tabs__item--yellow';
            }
            else if (prevItem.dataWidth <= minWidth &&
              currentLeft + prevItem.dataWidth + _transition > rightBorder &&
              currentLeft + prevItem.dataWidth <= rightBorder
            ) {
              item.style.left = currentLeft + prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 8) + 'px'
              currentLeft += prevItem.dataWidth - ((currentLeft + prevItem.dataWidth + _transition - rightBorder) / 8);
              item.className = 'tabs__item tabs__item--pink';
            }
            else if (
              prevItem.dataWidth <= minWidth &&
              currentLeft + prevItem.dataWidth + 20 > rightBorder
            ) {
              item.style.left = currentLeft + prevItem.dataWidth - 8 + 'px';
              currentLeft += prevItem.dataWidth - 8;
              item.className = 'tabs__item tabs__item--blue';
            }
            else {
              currentLeft += prevItem.dataWidth;
              item.style.left = currentLeft + 'px';
              item.className = 'tabs__item tabs__item--green';
            }
            // verticalCurrentLeft.style.left = currentLeft + 'px';
            prevItem = item;
            if (!--count) {
              // return false;
            }
          });
        // }, 100);
      }
    };

//#####################

    rightElement.addEventListener('click', function (e)
    {
      leftIdent += parseInt(elementWidth * 0.7, 10);
      if (leftIdent > wrapWidth - elementWidth) {
        leftIdent = wrapWidth - elementWidth;
      }
      wrap.style.left = '-' + leftIdent + 'px';
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
      var rightline = document.getElementsByClassName('vertical-line')[0];
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
      })
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
      })
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
