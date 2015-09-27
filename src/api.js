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
