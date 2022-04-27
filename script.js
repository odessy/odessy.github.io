/* -- page tabs javascript -- */
document.addEventListener("DOMContentLoaded", function(){
  const tabs = document.querySelectorAll('ul.tabs');
  tabs.forEach(function(el){
    let links = el.querySelectorAll('a');
    let active = el.querySelector('li:first-child a');
    let content = document.querySelector(active.getAttribute('href'));

    active.classList.add('active');
    
    links.forEach(function (link) {
      const a = document.querySelector(link.getAttribute('href'));
      if(a && link !== active){
        a.style.display = 'none';
      }
      link.addEventListener('click', function(e){
        e.preventDefault();
        active.classList.remove('active');
        content.style.display = 'none';
        active = e.target;
        content = document.querySelector(active.getAttribute('href'));
        active.classList.add('active');
        if(content){
           content.style.display = 'block';
        }
        return false;
      });       
    });
  });
});
/* - end tabs - */