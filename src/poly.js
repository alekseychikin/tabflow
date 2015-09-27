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
