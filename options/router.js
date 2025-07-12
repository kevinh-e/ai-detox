const routes = {
  'general': 'general',
  'filters': 'filters',
  'appearance': 'appearance',
  'about': 'about'
};

const app = document.getElementById('app');
const links = document.querySelectorAll('.nav-element');
let currentModule = null;

export function init() {
  window.addEventListener('hashchange', () => loadRoute());
  window.addEventListener('load', () => loadRoute());
}

async function loadRoute() {
  const routeName = window.location.hash.replace("#", '') || '/general';
  const route = routes[routeName] || 'general';

  // 0.5 cleanup previous js
  currentModule?.cleanup?.();

  // 1. fetch + inject html
  console.log(`fetching /options/pages/${route}.html`)
  const html = await fetch(`/options/pages/${route}.html`).then(r => r.text());
  app.innerHTML = html;

  // 2. import and run js module
  console.log(`fetching /options/pages/${route}.js`)
  const module = await import(`/options/scripts/${route}.js`);
  currentModule = module;
  currentModule?.init?.();

  // 3. update nav
  links.forEach(link => {
    link.classList.toggle(
      'active-nav',
      link.getAttribute('href') === `#${route}`
    );
  });
}

init();
