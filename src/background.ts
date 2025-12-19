import { NudgeStats, DEFAULT_SETTINGS, DEFAULT_STATS } from './constants/types';

// Setup alarm for session cleanup
const setupAlarm = async () => {
  try {
    // Check if alarm already exists
    const existingAlarm = await chrome.alarms.get('cleanup-sessions');
    if (!existingAlarm) {
      await chrome.alarms.create('cleanup-sessions', { periodInMinutes: 1 });
    }
  } catch (error) {
    console.error('Nudge: Failed to setup alarm', error);
  }
};

// Clean up expired sessions periodically
const cleanupExpiredSessions = async () => {
  try {
    const result = await chrome.storage.local.get('sessions');
    const sessions = result.sessions || { unlockedDomains: {} };
    const now = Date.now();
    let hasChanges = false;

    for (const domain in sessions.unlockedDomains) {
      if (sessions.unlockedDomains[domain] < now) {
        delete sessions.unlockedDomains[domain];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await chrome.storage.local.set({ sessions });
    }
  } catch (error) {
    console.error('Nudge: Failed to cleanup sessions', error);
  }
};

// Update badge with stats
const updateBadge = async () => {
  try {
    const result = await chrome.storage.sync.get('stats');
    const stats: NudgeStats = result.stats || DEFAULT_STATS;

    // Show temptations resisted count on badge
    const count = stats.temptationsResisted;
    if (count > 0) {
      await chrome.action.setBadgeText({ text: count.toString() });
      await chrome.action.setBadgeBackgroundColor({ color: '#4FD1C5' });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Nudge: Failed to update badge', error);
  }
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.sync.set({
      settings: DEFAULT_SETTINGS,
      stats: DEFAULT_STATS,
    });

    // Initialize sessions
    await chrome.storage.local.set({
      sessions: { unlockedDomains: {} },
    });

    // Open options page on install
    chrome.runtime.openOptionsPage();
  }

  // Setup alarm on install or update
  await setupAlarm();
  await updateBadge();
});

// Re-setup alarm when service worker starts
chrome.runtime.onStartup.addListener(async () => {
  await setupAlarm();
  await updateBadge();
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLOSE_TAB') {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('settings').then((result) => {
      sendResponse(result.settings || DEFAULT_SETTINGS);
    });
    return true; // Keep channel open for async response
  }
});

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup-sessions') {
    cleanupExpiredSessions();
  }
});

// Update badge when stats change
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.stats) {
    updateBadge();
  }
});

// Handle action click - open options page
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
