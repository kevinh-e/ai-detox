function injectJS() {
  const script = document.createElement('script');
  script.id = 'blocker-script'; // Give it an ID for easy removal
  script.type = 'module';
  script.src = chrome.runtime.getURL('resources/overlay/overlay.js');
  script.defer = true;
  document.body.appendChild(script);
}

(async () => {
  const response = await chrome.runtime.sendMessage({ type: "getBlockSettings" });
  const { isBlocked, proceedMode, proceedText, confirmText, confirmMode } = response;
  const settings = {
    proceedMode,
    proceedText,
    confirmText,
    confirmMode,
  };

  if (isBlocked) {
    const url = chrome.runtime.getURL("resources/overlay/overlay.html");
    const html = await fetch(url).then(r => r.text());
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // Find the overlay element and attach data to it
    const overlay = wrapper.querySelector('#blocker-overlay');
    overlay.addEventListener('overlayReady', () => {
      overlay.dispatchEvent(new CustomEvent('overlaySettings', { detail: settings }));
    });

    const logo = wrapper.querySelector('#no-ai-logo')
    logo.src = chrome.runtime.getURL('images/logo.svg');

    document.documentElement.appendChild(wrapper);

    // 2. Inject the CSS stylesheet
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = chrome.runtime.getURL('resources/overlay/overlay.css');
    document.head.appendChild(cssLink);

    // 3. Inject the behavior script
    // If we're already past DOMContentLoaded, just go.
    // Otherwise wait.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectJS);
    } else {
      injectJS();
    }
  }
})();

