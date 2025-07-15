function injectJS() {
  const script = document.createElement('script');
  script.id = 'blocker-script'; // Give it an ID for easy removal
  script.type = 'module';
  script.src = chrome.runtime.getURL('resources/overlay/overlay.js');
  // script.defer = true;
  document.body.appendChild(script);
}

(async () => {
  const response = await chrome.runtime.sendMessage({ type: "getBlockSettings" });
  const { enabled, isBlocked, proceedMode, proceedText, confirmText, confirmMode } = response;
  const settings = {
    enabled,
    proceedMode,
    proceedText,
    confirmText,
    confirmMode,
  };

  if (isBlocked && enabled) {
    const [overlayHtml, overlayCss] = await Promise.all([
      fetch(chrome.runtime.getURL("resources/overlay/overlay.html")).then(r => r.text()),
      fetch(chrome.runtime.getURL("resources/overlay/overlay.css")).then(r => r.text()),
    ]);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = overlayHtml;

    // Find the overlay element and attach data to it
    const overlay = wrapper.querySelector('#blocker-overlay');
    overlay.addEventListener('overlayReady', () => {
      overlay.dispatchEvent(new CustomEvent('overlaySettings', { detail: settings }));
    });

    const logo = wrapper.querySelector('#no-ai-logo')
    logo.src = chrome.runtime.getURL('images/logo.svg');

    document.documentElement.appendChild(wrapper);

    // 2. Inject the CSS stylesheet
    const style = document.createElement('style');
    style.textContent = overlayCss;
    document.head.appendChild(style);

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

