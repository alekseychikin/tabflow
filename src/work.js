var tabflow = require('./tabflow');

module.exports = function (options, _offset)
{
  var i;
  if (!_offset) _offset = options.offset;
  if (_offset - options.prevOffset < -2) {
    for (i = options.prevOffset; i > _offset; i -= 1) {
      tabflow(options, i);
    }
    tabflow(options, _offset);
  }
  else if (_offset - options.prevOffset > 2) {
    for (i = options.prevOffset; i < _offset; i += 1) {
      tabflow(options, i);
    }
    tabflow(options, _offset);
  }
  else {
    tabflow(options, _offset);
  }
};
