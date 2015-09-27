function disableSelection (target)
{
  target.setAttribute('unselectable', 'on');
  target.style.userSelect = 'none';
  target.style.WebkitUserSelect = 'none';
  target.addEventListener('selectstart', function (e)
  {
    e.preventDefault();
  });
}
