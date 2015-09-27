// Ease function in-out
function InOut (k)
{
  if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
  return - 0.5 * ( --k * ( k - 2 ) - 1 );
}

// Ease function out-cubic
function OutCubic (p) {
  return (Math.pow((p - 1), 3) + 1);
}

module.exports = {
  InOut: InOut,
  OutCubic: OutCubic
};
