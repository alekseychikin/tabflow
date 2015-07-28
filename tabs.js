(function ()
{
  var _forEach = function (elements, cb)
  {
    var i, len;
    for (i = 0, len = elements.length; i < len; i = i + 1) {
      cb(elements[i], i);
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
    var rightBorder = elementWidth - 100;

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
      item.dataWidth = _width(item, false);
    });

    _forEach(childs, function (item)
    {
      item.style.position = 'absolute';
      item.style.left = item.dataLeft + 'px';
      item.style.width = item.dataWidth + 'px';
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

    var _work = function ()
    {
      var _left;
      var prevItem;
      _forEach(childs, function (item)
      {
        if (item.dataLeft > rightBorder + leftIdent && item.dataLeft < rightBorder + leftIdent + diffValue) {
          // начать смещать
          // item.style.left = _log(item.dataLeft - rightBorder - leftIdent, 3);
          // console.log(item.dataLeft - rightBorder - leftIdent);
          _left = item.dataLeft - (getRightIdent(item.dataLeft - rightBorder - leftIdent)) * 100;
          console.log (item.dataLeft, _left);
          item.style.left = _left + 'px';
        }
        else {
          item.style.left = item.dataLeft + 'px';
        }
      });
    };

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
      elementWidth = _width(element);
      rightBorder = elementWidth - 100;
      _work();
    });
  });
})();
