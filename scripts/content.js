(async () => {
  const response = await chrome.runtime.sendMessage({ type: "getBlockSettings" });
  const { isBlocked, proceedMode, proceedText } = response;

  if (isBlocked) {
    const url = chrome.runtime.getURL("resources/overlay/overlay.html");
    const html = await fetch(url).then(r => r.text());
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // Find the overlay element and attach data to it
    const overlayElement = wrapper.querySelector('#blocker-overlay');
    overlayElement.dataset.proceedMode = proceedMode;
    overlayElement.dataset.proceedText = proceedText;


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
    const script = document.createElement('script');
    script.id = 'blocker-script'; // Give it an ID for easy removal
    script.src = chrome.runtime.getURL('resources/overlay/overlay.js');
    document.body.appendChild(script);
  }
})();

