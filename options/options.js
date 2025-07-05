const BLOCKED_SITES_KEY = 'blockedSites';
const MODE_KEY = 'proceedMode';
const PROCEED_TEXT_KEY = 'proceedText';

const defaultLLMSites = [
  "*://chatgpt.com/*",
  "*://gemini.google.com/*",
  "*://claude.ai/*",
  "*://poe.com/*",
  "*://copilot.microsoft.com/*",
  "*://v0.dev/*"
];

const blockedSitesTextarea = document.getElementById('blockedSites');
const proceedModeCheckbox = document.getElementById('proceedMode');
const proceedText2Input = document.getElementById('proceedText');
const settingsDiv = document.getElementById('settings');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY, PROCEED_TEXT_KEY])
    .then((settings) => {
      blockedSitesTextarea.value = settings[BLOCKED_SITES_KEY] || defaultLLMSites;
      proceedModeCheckbox.checked = settings[MODE_KEY];
      proceedText2Input.value = settings[PROCEED_TEXT_KEY] || "I'm sure I want to use AI.";
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

  const blockedSites = blockedSitesTextarea.value.split(',').map(s => s.trim()).filter(s => s !== '');
  const proceedMode = proceedModeCheckbox.checked;
  const proceedText = proceedText2Input.value.trim();

  chrome.storage.sync.set({
    [BLOCKED_SITES_KEY]: blockedSites,
    [MODE_KEY]: proceedMode,
    [PROCEED_TEXT_KEY]: proceedText
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
    settingsDiv.style.display = 'block';
  } else {
    settingsDiv.style.display = 'none';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);
proceedModeCheckbox.addEventListener('change', toggleConfirmationSettings);
