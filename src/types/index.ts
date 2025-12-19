/**
 * Nudge Extension Type Definitions
 * All interfaces and types for the extension
 */

/** User-configurable settings stored in chrome.storage.sync */
export interface NudgeSettings {
  /** List of domains that trigger the mindfulness overlay */
  blacklist: string[];
  /** Duration of the breathing pause in seconds (5-30) */
  pauseDuration: number;
  /** How long a domain stays unlocked after continuing, in minutes (1-60) */
  unlockDuration: number;
  /** UI theme preference */
  theme: Theme;
}

/** Available theme options */
export type Theme = 'light' | 'dark' | 'system';

/** Usage statistics stored in chrome.storage.sync */
export interface NudgeStats {
  /** Number of times user clicked "Close Tab" */
  temptationsResisted: number;
  /** Number of times user clicked "Continue" */
  intentionalVisits: number;
}

/** Session data stored in chrome.storage.local */
export interface SessionData {
  /** Map of domain -> Unix timestamp when unlock expires */
  unlockedDomains: Record<string, number>;
}

/** Message types for communication between content script and background */
export type RuntimeMessage =
  | { type: 'CLOSE_TAB' }
  | { type: 'GET_SETTINGS'; response?: NudgeSettings }
  | { type: 'CHECK_DOMAIN'; domain: string }
  | { type: 'DOMAIN_STATUS'; isBlocked: boolean; isUnlocked: boolean };

/** Default settings for new installations */
export const DEFAULT_SETTINGS: Readonly<NudgeSettings> = {
  blacklist: [
    'twitter.com',
    'x.com',
    'facebook.com',
    'instagram.com',
    'reddit.com',
    'tiktok.com',
    'youtube.com',
  ],
  pauseDuration: 10,
  unlockDuration: 15,
  theme: 'system',
} as const;

/** Default statistics for new installations */
export const DEFAULT_STATS: Readonly<NudgeStats> = {
  temptationsResisted: 0,
  intentionalVisits: 0,
} as const;

/** Default session data */
export const DEFAULT_SESSION: Readonly<SessionData> = {
  unlockedDomains: {},
} as const;

/** Storage keys used throughout the extension */
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  STATS: 'stats',
  SESSIONS: 'sessions',
} as const;

/** Alarm names used by the background script */
export const ALARM_NAMES = {
  CLEANUP_SESSIONS: 'cleanup-sessions',
} as const;
