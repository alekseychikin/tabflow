var elements = [];

function cachedElements()
{
  return elements;
}

cachedElements.push = function (element)
{
  elements.push(element);
};
cachedElements.del = function (index)
{
  elements.splice(index, 1);
};

module.exports = cachedElements;
