/* -- page tabs javascript -- */
document.addEventListener("DOMContentLoaded", function(){
  const tabs = document.querySelectorAll('.tabs');
  //generate tab links
  tabs.forEach(function(el){
    let links = el.querySelectorAll('.tab');
	let tabNav = '';
    links.forEach(function (link, index) {
		let name = link.getAttribute('name');
		link.setAttribute('id','tab-'+index); 
		tabNav += '<li><a href="#tab-'+index+'">'+name+'</a></li>';
    });
	el.innerHTML = '<ul class="tabs-nav">'+tabNav+'</ul>' + el.innerHTML;
  });
  //add event to tab links
  tabs.forEach(function(el){
    let links = el.querySelectorAll('a');
    let active = el.querySelector('li:first-child a');
    let content = el.querySelector(active.getAttribute('href'));

    active.classList.add('active');
    
    links.forEach(function (link) {
      const a = el.querySelector(link.getAttribute('href'));
      if(a && link !== active){
        a.style.display = 'none';
      }
      link.addEventListener('click', function(e){
        e.preventDefault();
        active.classList.remove('active');
        content.style.display = 'none';
        active = e.target;
        content = el.querySelector(active.getAttribute('href'));
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