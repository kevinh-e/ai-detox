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

async function updateBlockingRules() {
  const settings = await chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY])
  const blockedSites = settings[BLOCKED_SITES_KEY] || defaultLLMSites;

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
  if (areaName === 'sync' && (changes[BLOCKED_SITES_KEY] || changes[MODE_KEY] || changes[CONFIRM_MODE_KEY])) {
    updateBlockingRules();
  }
});

chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);

// listen for the confirmation text
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getBlockSettings") {
    chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY, PROCEED_TEXT_KEY, CONFIRM_TEXT_KEY, CONFIRM_MODE_KEY])
      .then(settings => {
        const blockedSites = settings[BLOCKED_SITES_KEY] || defaultLLMSites;
        const proceedMode = settings[MODE_KEY] || true;
        const proceedText = settings[PROCEED_TEXT_KEY] || "I'm sure I want to use AI.";
        const confirmText = settings[CONFIRM_TEXT_KEY] || "Confirm";
        const confirmMode = settings[CONFIRM_MODE_KEY] || true;

        const url = sender.tab.url;
        const isBlocked = blockedSites.some(pattern => {
          const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
          return regex.test(url)
        });

        sendResponse({
          isBlocked: isBlocked,
          proceedMode: proceedMode,
          proceedText: proceedText,
          confirmText: confirmText,
          confirmMode: confirmMode
        });
      });
    return true;
  }
});
