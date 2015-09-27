(function (factory)
{
  if ( typeof module === 'object' && typeof module.exports === 'object' ) {
    module.exports = factory();
  }
  else if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['tabflow'], factory);
  }
  else {
    // Browser globals:
    window.tabflow = factory();
  }
})(function ()
{
