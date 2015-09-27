var checkToLimitOffset = require('./check-to-limit-offset');
var work = require('./work');

module.exports = function (options)
{
  options.offset = checkToLimitOffset(options, options.offset);
  options.wrap.style.left = - options.offset + 'px';
  work(options);
};
