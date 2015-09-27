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
