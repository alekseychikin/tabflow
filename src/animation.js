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
