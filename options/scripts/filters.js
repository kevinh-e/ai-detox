import { defaultLLMSites, STORAGE_KEYS } from "../../config.js";

const {
  BLOCKED_SITES,
  FILTER_MODE,
  PROCEED_TEXT,
  CONFIRM_TEXT,
  CONFIRM_MODE,
} = STORAGE_KEYS;

const blockedSitesTextarea = document.getElementById('blockedSites');
const filterModeCheckbox = document.getElementById('filterMode');
const confirmModeCheckbox = document.getElementById('confirmMode');
const proceedTextInput = document.getElementById('proceedText');
const confirmTextInput = document.getElementById('confirmText');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

export function init() {
  loadSettings();
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(Object.values(STORAGE_KEYS))
    .then((settings) => {
      console.log("load settings: ", settings);
      const savedSites = settings[BLOCKED_SITES];

      blockedSitesTextarea.value = (savedSites && savedSites.length > 0) ? savedSites.join('\n') : defaultLLMSites.join('\n');
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

  const settings = {
    [BLOCKED_SITES]: blockedSites,
  }

  console.log(settings);

  chrome.storage.sync.set(settings)
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

// Event Listeners
saveButton.addEventListener('click', saveSettings);
window.addEventListener('DOMContentLoaded', init);
loadSettings();
