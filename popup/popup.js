const STORAGE_KEYS = {
  ENABLED: 'globalEnabled'
};

document.addEventListener("DOMContentLoaded", async () => {
  // Get current tab info
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      const hostname = url.hostname.replace(/^www\./, '');
      document.getElementById('websiteName').textContent = hostname;
    } else {
      document.getElementById('websiteName').textContent = "Unable to get URL";
    }
  } catch (error) {
    console.error('Error getting tab info:', error);
    document.getElementById('websiteName').textContent = "Error loading page";
  }

  // Load current enabled state
  await loadEnabledState();

  // Set up event listeners
  setupEventListeners();
});

async function loadEnabledState() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEYS.ENABLED]);
    const isEnabled = result[STORAGE_KEYS.ENABLED] ?? true;
    updatePowerButtonState(isEnabled);
  } catch (error) {
    console.error('Error loading enabled state:', error);
    updatePowerButtonState(true); // Default to enabled
  }
}

function updatePowerButtonState(isEnabled) {
  const powerContainer = document.getElementById('powerIconContainer');
  const statusText = document.getElementById('statusText');

  // Remove existing state classes
  powerContainer.classList.remove('enabled', 'disabled');

  if (isEnabled) {
    powerContainer.classList.add('enabled');
    statusText.textContent = 'Enabled';
  } else {
    powerContainer.classList.add('disabled');
    statusText.textContent = 'Disabled';
  }
}

async function toggleEnabled() {
  try {
    // Get current state
    const result = await chrome.storage.sync.get([STORAGE_KEYS.ENABLED]);
    const currentState = result[STORAGE_KEYS.ENABLED] ?? true;
    const newState = !currentState;

    // Save new state
    await chrome.storage.sync.set({ [STORAGE_KEYS.ENABLED]: newState });

    // Update UI
    updatePowerButtonState(newState);

  } catch (error) {
    console.error('Error toggling enabled state:', error);
    const statusText = document.getElementById('statusText');
    statusText.textContent = 'Error saving setting';
    statusText.style.color = 'var(--rose)';
  }
}

function setupEventListeners() {
  // Power button toggle
  document.getElementById('powerIconContainer').addEventListener('click', toggleEnabled);

  // Options page button
  document.getElementById('optionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // GitHub issues button
  document.getElementById('githubBtn').addEventListener('click', () => {
    chrome.tabs.create({
      url: "https://github.com/kevinh-e/ai-detox/issues/new"
    });
    window.close();
  });
}
