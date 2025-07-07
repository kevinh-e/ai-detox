const routes = {
  'general': { html: 'options/pages/general.html', js: 'options/scripts/general.js' },
  'filters': { html: 'options/pages/filters.html', js: 'options/scripts/filters.js' },
  'appearance': { html: 'options/pages/appearance.html', js: 'options/scripts/appearance.js' },
  'about': { html: 'options/pages/about.html', js: 'options/scripts/about.js' },
};


const app = document.getElementById('app');
let currentScript;

async function router() {
  const path = location.hash.slice(1) || '/';
  const route = routes[path];

  if (route) {
    // inject html and js
    const url = chrome.runtime.getURL(route.html);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network response wasnt ok :/. HTTP ${res.status}`);

      const html = await res.text();
      app.innerHTML = html;
    } catch (err) {
      app.innerHTML = '<h1>Error</h1><p>Could not load page :c</p>';
      console.error(err);
    }

    if (currentScript) {
      currentScript.remove();
      currentScript = null;
    }
    const module = await import(chrome.runtime.getURL(route.js)).catch(err => {
      console.error('Failed to load script:', route.js, err);
    });
    console.log("loadSettings")
    module.loadSettings?.();

    // const script = document.createElement('script');
    // script.type = 'module';
    // script.src = chrome.runtime.getURL(route.js);
    // document.body.appendChild(script);
    // currentScript = script;
  }

  // default (index.html route)
  else {
    const url = chrome.runtime.getURL(routes['general'].html);
    const res = await fetch(url);
    const html = await res.text();
    app.innerHTML = html;

    const module = await import(chrome.runtime.getURL(route.js)).catch(err => {
      console.error('Failed to load script:', route.js, err);
    });
    module.loadSettings?.();
  }

  // update active nav
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.toggle(
      'active',
      link.getAttribute('href') === `#${path}`
    );
  });
}

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);
