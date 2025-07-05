const BLOCKED_SITES_KEY = 'blockedSites';
const MODE_KEY = 'proceedMode';
const PROCEED_TEXT_KEY = 'proceedText';
const CONFIRM_TEXT_KEY = 'confirmText';
const CONFIRM_MODE_KEY = 'confirmMode';

const defaultLLMSites = [
  "*://chatgpt.com/*",
  "*://gemini.google.com/*",
  "*://claude.ai/*",
  "*://www.perplexity.ai/*",
  "*://poe.com/*",
  "*://copilot.microsoft.com/*",
  "*://v0.dev/*"
];

const blockedSitesTextarea = document.getElementById('blockedSites');
const proceedModeCheckbox = document.getElementById('proceedMode');
const confirmModeCheckbox = document.getElementById('confirmMode');
const proceedTextInput = document.getElementById('proceedText');
const confirmTextInput = document.getElementById('confirmText');
const settingsDiv = document.getElementById('settings');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY, PROCEED_TEXT_KEY, CONFIRM_TEXT_KEY, CONFIRM_MODE_KEY])
    .then((settings) => {
      const savedSites = settings[BLOCKED_SITES_KEY];
      blockedSitesTextarea.value = (savedSites && savedSites.length > 0) ? savedSites.join('\n') : defaultLLMSites.join('\n');
      proceedModeCheckbox.checked = settings[MODE_KEY] || true;
      proceedTextInput.value = settings[PROCEED_TEXT_KEY] || "I'm sure I want to use AI.";
      confirmTextInput.value = settings[CONFIRM_TEXT_KEY] || "Confirm";
      toggleConfirmationSettings();
    })
    .catch(error => {
      console.error("Error loading settings:", error);
      statusDiv.textContent = 'Error loading settings.';
      statusDiv.style.color = 'red';
    });
}

// Save settings
function saveSettings() {
  console.log("saving");

  const blockedSites = blockedSitesTextarea.value.split('\n').map(s => s.trim()).filter(s => s !== '');
  const proceedMode = proceedModeCheckbox.checked;
  const proceedText = proceedTextInput.value.trim();
  const confirmText = confirmTextInput.value.trim();
  const confirmMode = confirmModeCheckbox.checked;

  chrome.storage.sync.set({
    [BLOCKED_SITES_KEY]: blockedSites,
    [MODE_KEY]: proceedMode,
    [PROCEED_TEXT_KEY]: proceedText,
    [CONFIRM_TEXT_KEY]: confirmText,
    [CONFIRM_MODE_KEY]: confirmMode
  })
    .then(() => {
      statusDiv.textContent = 'Settings saved!';
      statusDiv.style.color = 'green';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    })
    .catch(error => {
      console.error("Error saving settings:", error);
      statusDiv.textContent = 'Error saving settings.';
      statusDiv.style.color = 'red';
    });
}

// Toggle visibility of confirmation text input
function toggleConfirmationSettings() {
  if (proceedModeCheckbox.checked) {
    confirmModeCheckbox.disabled = false;
    confirmTextInput.disabled = false;
  } else {
    confirmModeCheckbox.disabled = true;
    confirmTextInput.disabled = true;
  }
}

// Event Listeners
saveButton.addEventListener('click', saveSettings);
proceedModeCheckbox.addEventListener('change', toggleConfirmationSettings);
loadSettings();
