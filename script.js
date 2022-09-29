/* -- Copy text javascript -- */
function createNode(text) {
  const node = document.createElement('pre');
  node.style.width = '1px';
  node.style.height = '1px';
  node.style.position = 'fixed';
  node.style.top = '5px';
  node.textContent = text;
  return node;
}

function copyNode(node) {
  //if ('clipboard' in navigator) {
  // eslint-disable-next-line flowtype/no-flow-fix-me-comments
  // $FlowFixMe Clipboard is not defined in Flow yet.
  //return navigator.clipboard.writeText(node.textContent);
  //}

  const selection = getSelection();

  if (selection == null) {
    return Promise.reject(new Error());
  }

  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  return Promise.resolve();
}

function copyText(text) {
  if ('clipboard' in navigator) {
    // eslint-disable-next-line flowtype/no-flow-fix-me-comments
    // $FlowFixMe Clipboard is not defined in Flow yet.
    return navigator.clipboard.writeText(text);
  }

  const body = document.body;

  if (!body) {
    return Promise.reject(new Error());
  }

  const node = createNode(text);
  body.appendChild(node);
  copyNode(node);
  body.removeChild(node);
  return Promise.resolve();
}

function copyTarget(content) {
  if (content instanceof HTMLInputElement || content instanceof HTMLTextAreaElement) {
    return copyText(content.value);
  } else if (content instanceof HTMLAnchorElement && content.hasAttribute('href')) {
    return copyText(content.href);
  } else {
    return copyNode(content);
  }
}

function copy(button) {
  const id = button.getAttribute('for');
  const text = button.getAttribute('value');

  function trigger() {
    button.dispatchEvent(new CustomEvent('clipboard-copy', {
      bubbles: true
    }));
  }

  if (text) {
    copyText(text).then(trigger);
  } else if (id) {
    const root = 'getRootNode' in Element.prototype ? button.getRootNode() : button.ownerDocument;
    if (!(root instanceof Document || 'ShadowRoot' in window && root instanceof ShadowRoot)) return;
    const node = root.getElementById(id);
    if (node) copyTarget(node).then(trigger);
  }
}

function clicked(event) {
  const button = event.currentTarget;

  if (button instanceof HTMLElement) {
    copy(button);
  }
}

function keydown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    const button = event.currentTarget;

    if (button instanceof HTMLElement) {
      event.preventDefault();
      copy(button);
    }
  }
}

function focused(event) {
  event.currentTarget.addEventListener('keydown', keydown);
}

function blurred(event) {
  event.currentTarget.removeEventListener('keydown', keydown);
}

class ClipboardCopyElement extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', clicked);
    this.addEventListener('focus', focused);
    this.addEventListener('blur', blurred);
  }

  connectedCallback() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(text) {
    this.setAttribute('value', text);
  }

}

if (!window.customElements.get('clipboard-copy')) {
  window.ClipboardCopyElement = ClipboardCopyElement;
  window.customElements.define('clipboard-copy', ClipboardCopyElement);
}

function toogleDisplay(elem){
  if(elem){
    if (elem.style.display === "none") {
      elem.style.display = "block";
    } else {
      elem.style.display = "none";
    }   
  }
}

document.addEventListener('clipboard-copy', (e) => {
  //get target and add success class to clipboard element
  let svgs = e.target.querySelectorAll('svg');
  if(svgs.length == 2){
    let toggle = function(){
      toogleDisplay(svgs[0]);
      toogleDisplay(svgs[1]);
      e.target.classList.toggle('tooltipped');
    }
    toggle();
    setTimeout(toggle, 2000);    
  }

});
/* -- end -- */

/* -- page tabs javascript -- */
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll('.tabs');
  //generate tab links
  tabs.forEach(function (el) {
    let links = el.querySelectorAll('.tab');
    let tabNav = '';
    links.forEach(function (link, index) {
      let name = link.getAttribute('name');
      link.setAttribute('id', 'tab-' + index);
      tabNav += '<li><a href="#tab-' + index + '">' + name + '</a></li>';
    });
    el.innerHTML = '<ul class="tabs-nav">' + tabNav + '</ul>' + el.innerHTML;
  });
  //add event to tab links
  tabs.forEach(function (el) {
    let links = el.querySelectorAll('a');
    let active = el.querySelector('li:first-child a');
    let content = el.querySelector(active.getAttribute('href'));

    active.classList.add('active');

    links.forEach(function (link) {
      const a = el.querySelector(link.getAttribute('href'));
      if (a && link !== active) {
        a.style.display = 'none';
      }
      link.addEventListener('click', function (e) {
        e.preventDefault();
        active.classList.remove('active');
        content.style.display = 'none';
        active = e.target;
        content = el.querySelector(active.getAttribute('href'));
        active.classList.add('active');
        if (content) {
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
      { passive: true }
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