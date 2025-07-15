document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        let hostname = url.hostname.replace(/^www\./, '');
        document.getElementById('websiteName').textContent = hostname;
      } catch (e) {
        document.getElementById('websiteName').textContent = "Invalid URL.";
      }
    } else {
      document.getElementById('websiteName').textContent = "Could not get website URL.";
    }
  });
});


