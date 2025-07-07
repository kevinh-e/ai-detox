import { defaultLLMSites, STORAGE_KEYS } from "../config.js";

const {
  BLOCKED_SITES,
  FILTER_MODE,
  PROCEED_TEXT,
  CONFIRM_TEXT,
  CONFIRM_MODE,
} = STORAGE_KEYS;

async function updateBlockingRules() {
  const settings = await chrome.storage.sync.get([BLOCKED_SITES])
  const blockedSites = settings[BLOCKED_SITES] || defaultLLMSites;

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);
  if (existingRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds
    });
  }

  const newRules = [];
  blockedSites.forEach((urlPattern, index) => {
    newRules.push({
      id: index + 1,
      priority: 1,
      condition: {
        urlFilter: urlPattern,
        resourceTypes: ["main_frame"]
      },
      action: {
        type: "allow"
      }
    });
  });

  if (newRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules
    });
    console.log("Declarative Net Request rules update:", newRules);
  } else {
    console.log("No blocking rules added.");
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && (changes[BLOCKED_SITES])) {
    updateBlockingRules();
  }
});

chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);

// listen for the confirmation text
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getBlockSettings") {
    chrome.storage.sync.get(Object.values(STORAGE_KEYS))
      .then(settings => {
        const blockedSites = settings[BLOCKED_SITES] || defaultLLMSites;

        const url = sender.tab.url;
        const isBlocked = blockedSites.some(pattern => {
          const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
          return regex.test(url)
        });

        sendResponse({
          isBlocked: isBlocked,
          proceedMode: settings[FILTER_MODE] ?? true,
          proceedText: settings[PROCEED_TEXT] || "I'm sure I want to use AI.",
          confirmText: settings[CONFIRM_TEXT] || "Confirm",
          confirmMode: settings[CONFIRM_MODE] ?? true,
        });
      });
    return true;
  }
});
