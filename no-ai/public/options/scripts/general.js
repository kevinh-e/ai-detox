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

// Load saved settings
export function loadSettings() {
  chrome.storage.sync.get(Object.values(STORAGE_KEYS))
    .then((settings) => {
      console.log("load settings: ", settings);
      const savedSites = settings[BLOCKED_SITES];

      blockedSitesTextarea.value = (savedSites && savedSites.length > 0) ? savedSites.join('\n') : defaultLLMSites.join('\n');
      filterModeCheckbox.checked = settings[FILTER_MODE] ?? true;
      confirmModeCheckbox.checked = settings[CONFIRM_MODE] ?? true;
      proceedTextInput.value = settings[PROCEED_TEXT] ?? "I'm sure I want to use AI.";
      confirmTextInput.value = settings[CONFIRM_TEXT] ?? "Confirm";

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
  const filterMode = filterModeCheckbox.checked;
  const proceedText = proceedTextInput.value.trim();
  const confirmText = confirmTextInput.value.trim();
  const confirmMode = confirmModeCheckbox.checked;

  const settings = {
    [BLOCKED_SITES]: blockedSites,
    [FILTER_MODE]: filterMode,
    [PROCEED_TEXT]: proceedText,
    [CONFIRM_TEXT]: confirmText,
    [CONFIRM_MODE]: confirmMode
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

// Toggle visibility of confirmation text input
function toggleConfirmationSettings() {
  if (filterModeCheckbox.checked) {
    confirmModeCheckbox.disabled = false;
    confirmTextInput.disabled = false;
  } else {
    confirmModeCheckbox.disabled = true;
    confirmTextInput.disabled = true;
  }
}

// Event Listeners
saveButton.addEventListener('click', saveSettings);
filterModeCheckbox.addEventListener('change', toggleConfirmationSettings);
loadSettings();
