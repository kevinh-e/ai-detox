import browser from "webextension-polyfill";
import { STORAGE_KEYS } from "../../config.js";

const {
    ENABLED,
    BLOCKED_SITES,
    FILTER_MODE,
    PROCEED_TEXT,
    CONFIRM_TEXT,
    CONFIRM_MODE,
} = STORAGE_KEYS;

let loadedSettings = null;

let enabledCheckbox;
let filterModeCheckbox;
let confirmModeCheckbox;
let proceedTextInput;
let confirmTextInput;
let saveButton;
let statusDiv;

export function init() {
    console.log("General initialising");

    enabledCheckbox = document.getElementById('globalEnabled');
    filterModeCheckbox = document.getElementById('filterMode');
    confirmModeCheckbox = document.getElementById('confirmMode');
    proceedTextInput = document.getElementById('proceedText');
    confirmTextInput = document.getElementById('confirmText');
    saveButton = document.getElementById('save-button');
    statusDiv = document.getElementById('status');

    loadSettings();

    saveButton.addEventListener('click', saveSettings);
    enabledCheckbox.addEventListener('change', toggleConfirmationSettings);
    filterModeCheckbox.addEventListener('change', toggleConfirmationSettings);
}

export function cleanup() {
    console.log("General cleaning up");

    saveButton?.removeEventListener('click', saveSettings);
    enabledCheckbox?.removeEventListener('change', toggleConfirmationSettings);
    filterModeCheckbox?.removeEventListener('change', toggleConfirmationSettings);
}

// Load saved settings
const loadSettings = () => {
    browser.storage.sync.get(Object.values(STORAGE_KEYS))
        .then((settings) => {
            loadedSettings = settings;
            console.log("General loading settings: ", settings);

            enabledCheckbox.checked = settings[ENABLED] ?? true;
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
    const enabled = enabledCheckbox.checked;
    const filterMode = filterModeCheckbox.checked;
    const proceedText = proceedTextInput.value.trim();
    const confirmText = confirmTextInput.value.trim();
    const confirmMode = confirmModeCheckbox.checked;

    const settings = {
        [ENABLED]: enabled,
        [BLOCKED_SITES]: loadedSettings[BLOCKED_SITES],
        [FILTER_MODE]: filterMode,
        [PROCEED_TEXT]: proceedText,
        [CONFIRM_TEXT]: confirmText,
        [CONFIRM_MODE]: confirmMode
    }

    console.log("Saving settings:", settings);

    browser.storage.sync.set(settings)
        .then(() => {
            statusDiv.textContent = 'Settings saved!';
            statusDiv.style.color = 'var(--emerald)';
            setTimeout(() => {
                status.textContent = '';
            }, 3000);
        })
        .catch(error => {
            console.error("Error saving settings:", error);
            statusDiv.textContent = 'Error saving settings.';
            statusDiv.style.color = 'var(--rose)';
        });
}

// Toggle visibility of confirmation text input
const toggleConfirmationSettings = () => {
    const enabled = enabledCheckbox.checked;
    const filterEnabled = enabled && filterModeCheckbox.checked;

    filterModeCheckbox.disabled = !enabled;
    proceedTextInput.disabled = !enabled;
    confirmModeCheckbox.disabled = !filterEnabled;
    confirmTextInput.disabled = !filterEnabled;
};