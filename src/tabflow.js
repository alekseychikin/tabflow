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
