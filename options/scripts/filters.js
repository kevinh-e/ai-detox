import { defaultLLMSites, STORAGE_KEYS } from "../../config.js";

const {
  BLOCKED_SITES,
} = STORAGE_KEYS;

let blockedSitesTextarea;
let saveButton;
let statusDiv;

let loadedSettings = null;

export function init() {
  console.log("General initialising");

  blockedSitesTextarea = document.getElementById('blockedSites');
  saveButton = document.getElementById('save-button');
  statusDiv = document.getElementById('status');

  loadSettings();

  saveButton.addEventListener('click', saveSettings);
}

export function cleanup() {
  console.log("Filters cleaning up");

  saveButton?.removeEventListener('click', saveSettings);
}

// Load saved settings
const loadSettings = () => {
  chrome.storage.sync.get(Object.values(STORAGE_KEYS))
    .then((settings) => {
      loadedSettings = settings;

      console.log("Filters loading settings: ", settings);

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
const saveSettings = () => {
  loadedSettings[BLOCKED_SITES] = blockedSitesTextarea.value.split('\n').map(s => s.trim()).filter(s => s !== '');
  console.log("Saving settings:", loadedSettings);

  chrome.storage.sync.set(loadedSettings)
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
