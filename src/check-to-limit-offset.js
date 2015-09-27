module.exports = function checkToLimitOffset(options, value)
{
  if (value > options.wrapWidth - options.elementWidth) {
    value = options.wrapWidth - options.elementWidth;
  }
  if (value < 0) {
    value = 0;
  }
  return value;
};
