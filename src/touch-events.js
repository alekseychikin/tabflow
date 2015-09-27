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
