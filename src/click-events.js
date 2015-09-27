var animation = require('./animation');
var slide = require('./slide');
var InOut = require('./ease').InOut;
var checkToLimitOffset = require('./check-to-limit-offset');
module.exports = function (options)
{
  options.rightElement.addEventListener('click', function (e)
  {
    animation(options.offset, checkToLimitOffset(options, options.offset + parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
    {
      options.offset = value;
      slide(options);
    });
    e.preventDefault();
    e.stopPropagation();
  }, false);

  options.leftElement.addEventListener('click', function (e)
  {
    animation(options.offset, checkToLimitOffset(options, options.offset - parseInt(options.elementWidth * 0.7, 10)), 300, InOut, function (value)
    {
      options.offset = value;
      slide(options);
    });
    e.preventDefault();
    e.stopPropagation();
  }, false);
};
