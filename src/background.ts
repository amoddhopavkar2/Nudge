/**
 * Nudge Background Service Worker
 * Handles session management, tab operations, and badge updates
 */

import {
  NudgeStats,
  SessionData,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_SESSION,
  STORAGE_KEYS,
  ALARM_NAMES,
} from './types';

/**
 * Initialize extension on first install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.STATS]: DEFAULT_STATS,
    });

    await chrome.storage.local.set({
      [STORAGE_KEYS.SESSIONS]: DEFAULT_SESSION,
    });

    chrome.runtime.openOptionsPage();
  }

  await setupAlarm();
  await updateBadge();
});

/**
 * Re-setup alarm when browser starts
 */
chrome.runtime.onStartup.addListener(async () => {
  await setupAlarm();
  await updateBadge();
});

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'CLOSE_TAB' && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id);
  }
  return true;
});

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAMES.CLEANUP_SESSIONS) {
    cleanupExpiredSessions();
  }
});

/**
 * Update badge when stats change
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes[STORAGE_KEYS.STATS]) {
    updateBadge();
  }
});

/**
 * Open options page when extension icon is clicked
 */
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

/**
 * Setup the session cleanup alarm
 */
async function setupAlarm(): Promise<void> {
  try {
    const existing = await chrome.alarms.get(ALARM_NAMES.CLEANUP_SESSIONS);
    if (!existing) {
      await chrome.alarms.create(ALARM_NAMES.CLEANUP_SESSIONS, {
        periodInMinutes: 1,
      });
    }
  } catch {
    // Alarm setup failed - sessions will still work, just won't auto-cleanup
  }
}

/**
 * Remove expired domain unlocks from session storage
 */
async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
    const sessions: SessionData = result[STORAGE_KEYS.SESSIONS] || { ...DEFAULT_SESSION };
    const now = Date.now();
    let modified = false;

    for (const domain of Object.keys(sessions.unlockedDomains)) {
      if (sessions.unlockedDomains[domain] < now) {
        delete sessions.unlockedDomains[domain];
        modified = true;
      }
    }

    if (modified) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });
    }
  } catch {
    // Cleanup failed - will retry on next alarm
  }
}

/**
 * Update the extension badge with temptations resisted count
 */
async function updateBadge(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.STATS);
    const stats: NudgeStats = result[STORAGE_KEYS.STATS] || DEFAULT_STATS;

    if (stats.temptationsResisted > 0) {
      const text = stats.temptationsResisted > 99 ? '99+' : String(stats.temptationsResisted);
      await chrome.action.setBadgeText({ text });
      await chrome.action.setBadgeBackgroundColor({ color: '#6e6e73' });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch {
    // Badge update failed - non-critical
  }
}
