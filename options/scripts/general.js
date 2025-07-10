import { defaultLLMSites, STORAGE_KEYS } from "../../config.js";

const {
  BLOCKED_SITES,
  FILTER_MODE,
  PROCEED_TEXT,
  CONFIRM_TEXT,
  CONFIRM_MODE,
} = STORAGE_KEYS;

let loadedSettings = null;

let filterModeCheckbox;
let confirmModeCheckbox;
let proceedTextInput;
let confirmTextInput;
let saveButton;
let statusDiv;

export function init() {
  console.log("General initialising");

  filterModeCheckbox = document.getElementById('filterMode');
  confirmModeCheckbox = document.getElementById('confirmMode');
  proceedTextInput = document.getElementById('proceedText');
  confirmTextInput = document.getElementById('confirmText');
  saveButton = document.getElementById('saveButton');
  statusDiv = document.getElementById('status');

  loadSettings();

  saveButton.addEventListener('click', saveSettings);
  filterModeCheckbox.addEventListener('change', toggleConfirmationSettings);
}

export function cleanup() {
  console.log("General cleaning up");

  saveButton?.removeEventListener('click', saveSettings);
  filterModeCheckbox?.removeEventListener('change', toggleConfirmationSettings);
}

// Load saved settings
const loadSettings = () => {
  chrome.storage.sync.get(Object.values(STORAGE_KEYS))
    .then((settings) => {
      loadedSettings = settings;
      console.log("General loading settings: ", settings);

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
const saveSettings = () => {
  const filterMode = filterModeCheckbox.checked;
  const proceedText = proceedTextInput.value.trim();
  const confirmText = confirmTextInput.value.trim();
  const confirmMode = confirmModeCheckbox.checked;

  const settings = {
    [BLOCKED_SITES]: loadedSettings[BLOCKED_SITES],
    [FILTER_MODE]: filterMode,
    [PROCEED_TEXT]: proceedText,
    [CONFIRM_TEXT]: confirmText,
    [CONFIRM_MODE]: confirmMode
  }

  console.log("Saving settings:", settings);

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
const toggleConfirmationSettings = () => {
  if (filterModeCheckbox.checked) {
    confirmModeCheckbox.disabled = false;
    confirmTextInput.disabled = false;
  } else {
    confirmModeCheckbox.disabled = true;
    confirmTextInput.disabled = true;
  }
}

