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

async function updateBlockingRules() {
  const settings = await chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY])
  const blockedSites = settings[BLOCKED_SITES_KEY] || defaultLLMSites;
  const proceedMode = settings[MODE_KEY] || false

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);
  if (existingRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds
    });
  }

  const newRules = [];
  blockedSites.forEach((urlPattern, index) => {
    if (!proceedMode) {
      newRules.push({
        id: index + 1,
        priority: 1,
        condition: {
          urlFilter: urlPattern,
          resourceTypes: ["main_frame"]
        }
      });
    }
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
  if (areaName === 'sync' && (changes[BLOCKED_SITES_KEY] || changes[MODE_KEY])) {
    updateBlockingRules();
  }
});

chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);

// listen for the confirmation text
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getBlockSettings") {
    chrome.storage.sync.get([BLOCKED_SITES_KEY, MODE_KEY, PROCEED_TEXT_KEY])
      .then(settings => {
        const blockedSites = settings[BLOCKED_SITES_KEY] || defaultLLMSites;
        const proceedMode = settings[MODE_KEY] || false;
        const proceedText = settings[PROCEED_TEXT_KEY] || "I'm sure I want to use AI."

        const url = sender.tab.url;
        const isBlocked = blockedSites.some(pattern => {
          const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
          return regex.test(url)
        });

        console.log(proceedMode);

        sendResponse({
          isBlocked: isBlocked,
          proceedMode: proceedMode,
          proceedText: proceedText
        });
      });
    return true;
  }
});


