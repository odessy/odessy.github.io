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
  
  
  let prev = window.pageYOffset;
  let up = null;
  let down = null;

  function dispatch() {
    const position = window.pageYOffset;
    if (position > prev) {
      down = true;
      up = false;
    } else if (position < prev) {
      down = false;
      up = true;
    } else {
      up = null;
      down = null;
    }
    prev = position;
    document.dispatchEvent(
      new CustomEvent('theme:scroll', {
        detail: {
          up,
          down,
          position,
        },
        bubbles: false,
      })
    );
  }  
  
  function scrollListener() {
    let timeout;
    window.addEventListener(
      'scroll',
      function () {
        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(function () {
          dispatch();
        });
      },
      {passive: true}
    );
  }

  scrollListener();  
  
  // Scroll to top button
  const scrollTopButton = document.querySelector('[data-scroll-top-button]');
  if (scrollTopButton) {
	scrollTopButton.addEventListener('click', () => {
	  window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth',
	  });
	});
	document.addEventListener('theme:scroll', () => {
	  scrollTopButton.classList.toggle('is-visible', window.pageYOffset > window.innerHeight);
	});
  }  
  
});
/* - end tabs - */