/**
 * Nudge Content Script
 * Injects a mindfulness overlay on blacklisted domains
 */

import { getRandomPrompt } from './constants/prompts';
import {
  NudgeSettings,
  NudgeStats,
  SessionData,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_SESSION,
  STORAGE_KEYS,
} from './types';
import {
  normalizeDomain,
  isDomainBlacklisted,
  isDomainUnlocked,
  resolveTheme,
} from './utils';

/** CSS styles for the overlay - neutral charcoal/grey palette */
const OVERLAY_STYLES = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.nudge-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  opacity: 0;
  transition: opacity 0.4s ease-out;
  overflow: hidden;
}

.nudge-overlay.visible {
  opacity: 1;
}

/* Light Theme - Soft whites and greys */
.nudge-overlay.theme-light {
  background: rgba(255, 255, 255, 0.95);
  color: #1d1d1f;
}

/* Dark Theme - True charcoal/black */
.nudge-overlay.theme-dark {
  background: rgba(0, 0, 0, 0.95);
  color: #f5f5f7;
}

.nudge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
  max-width: 90vw;
  width: 100%;
  padding: clamp(1.5rem, 4vw, 3rem);
  text-align: center;
}

/* Breathing Circle */
.breathing-circle-container {
  position: relative;
  width: clamp(120px, 25vmin, 200px);
  height: clamp(120px, 25vmin, 200px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.breathing-circle {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  animation: breathe 8s ease-in-out infinite;
}

.theme-light .breathing-circle {
  background: radial-gradient(circle, #e8e8ed 0%, #d2d2d7 100%);
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.05),
    inset 0 0 20px rgba(255, 255, 255, 0.5);
}

.theme-dark .breathing-circle {
  background: radial-gradient(circle, #3a3a3c 0%, #2c2c2e 100%);
  box-shadow:
    0 0 60px rgba(255, 255, 255, 0.03),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
}

/* Timer */
.timer {
  position: absolute;
  font-size: clamp(2rem, 5vmin, 3rem);
  font-weight: 200;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.theme-light .timer {
  color: #1d1d1f;
}

.theme-dark .timer {
  color: #f5f5f7;
}

/* Prompt */
.prompt {
  font-size: clamp(1.125rem, 3vmin, 1.5rem);
  font-weight: 400;
  line-height: 1.5;
  max-width: 28ch;
  letter-spacing: -0.01em;
}

.theme-light .prompt {
  color: #424245;
}

.theme-dark .prompt {
  color: #a1a1a6;
}

/* Breathing instruction */
.breathing-text {
  font-size: clamp(0.6875rem, 1.5vmin, 0.8125rem);
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0;
  animation: breatheText 8s ease-in-out infinite;
}

.theme-light .breathing-text {
  color: #86868b;
}

.theme-dark .breathing-text {
  color: #6e6e73;
}

@keyframes breatheText {
  0%, 45%, 100% { opacity: 0.4; }
  22.5% { opacity: 0.8; }
  72.5% { opacity: 0.8; }
}

/* Buttons */
.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 260px;
  margin-top: clamp(0.5rem, 2vh, 1rem);
}

.nudge-btn {
  padding: 0.875rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.nudge-btn:focus {
  outline: none;
}

.nudge-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Continue Button */
.continue-btn {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.continue-btn.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.theme-light .continue-btn {
  background: #1d1d1f;
  color: #ffffff;
}

.theme-light .continue-btn:hover {
  background: #424245;
}

.theme-light .continue-btn:active {
  transform: scale(0.98);
}

.theme-dark .continue-btn {
  background: #f5f5f7;
  color: #1d1d1f;
}

.theme-dark .continue-btn:hover {
  background: #e8e8ed;
}

.theme-dark .continue-btn:active {
  transform: scale(0.98);
}

/* Close Button */
.close-btn {
  background: transparent;
}

.theme-light .close-btn {
  color: #86868b;
}

.theme-light .close-btn:hover {
  color: #1d1d1f;
  background: rgba(0, 0, 0, 0.05);
}

.theme-dark .close-btn {
  color: #6e6e73;
}

.theme-dark .close-btn:hover {
  color: #f5f5f7;
  background: rgba(255, 255, 255, 0.05);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .breathing-circle {
    animation: none;
    transform: scale(1.2);
    opacity: 0.85;
  }

  .breathing-text {
    animation: none;
    opacity: 0.6;
  }

  .nudge-overlay,
  .continue-btn,
  .nudge-btn {
    transition: none;
  }
}
`;

/**
 * NudgeOverlay class handles the mindfulness overlay
 */
class NudgeOverlay {
  private shadowHost: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private timerInterval: number | null = null;
  private settings: NudgeSettings = { ...DEFAULT_SETTINGS };
  private readonly currentDomain: string;
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    this.currentDomain = normalizeDomain(window.location.hostname);
  }

  /**
   * Initialize the overlay - check if domain should be nudged
   */
  async init(): Promise<void> {
    try {
      await this.loadSettings();

      if (!this.shouldCheckDomain()) {
        return;
      }

      const shouldNudge = await this.shouldShowNudge();

      if (shouldNudge) {
        this.injectOverlay();
      }

      this.listenForChanges();
    } catch {
      // Fail silently - don't disrupt user browsing
    }
  }

  /**
   * Quick check if current domain could possibly be in blacklist
   */
  private shouldCheckDomain(): boolean {
    // Skip extension pages, local files, etc.
    const protocol = window.location.protocol;
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    // Skip if no blacklist
    if (!this.settings.blacklist.length) {
      return false;
    }

    return true;
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    if (result[STORAGE_KEYS.SETTINGS]) {
      this.settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
    }
  }

  /**
   * Check if the overlay should be shown
   */
  private async shouldShowNudge(): Promise<boolean> {
    // Check blacklist
    if (!isDomainBlacklisted(this.currentDomain, this.settings.blacklist)) {
      return false;
    }

    // Check if currently unlocked
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
    const sessions: SessionData = result[STORAGE_KEYS.SESSIONS] || DEFAULT_SESSION;

    if (isDomainUnlocked(this.currentDomain, sessions.unlockedDomains)) {
      return false;
    }

    return true;
  }

  /**
   * Listen for storage changes to react to settings updates
   */
  private listenForChanges(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
        this.settings = { ...DEFAULT_SETTINGS, ...changes[STORAGE_KEYS.SETTINGS].newValue };
      }

      if (areaName === 'local' && changes[STORAGE_KEYS.SESSIONS]) {
        this.handleSessionChange();
      }
    });
  }

  /**
   * Handle session storage changes
   */
  private async handleSessionChange(): Promise<void> {
    const shouldNudge = await this.shouldShowNudge();

    if (shouldNudge && !this.shadowHost) {
      this.injectOverlay();
    } else if (!shouldNudge && this.shadowHost) {
      this.removeOverlay();
    }
  }

  /**
   * Inject the overlay into the page
   */
  private injectOverlay(): void {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Create shadow host
    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'nudge-overlay-host';
    this.shadowHost.setAttribute('aria-hidden', 'false');
    this.shadowHost.style.cssText = `
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
    `;

    // Create closed shadow root for encapsulation
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = OVERLAY_STYLES;
    this.shadowRoot.appendChild(styleEl);

    // Create overlay
    const theme = resolveTheme(this.settings.theme);
    const prompt = getRandomPrompt();

    const overlay = document.createElement('div');
    overlay.className = `nudge-overlay theme-${theme}`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Mindfulness pause');
    overlay.innerHTML = `
      <div class="nudge-container">
        <span class="breathing-text" aria-hidden="true">Breathe</span>
        <div class="breathing-circle-container">
          <div class="breathing-circle" aria-hidden="true"></div>
          <span class="timer" role="timer" aria-live="polite">${this.settings.pauseDuration}</span>
        </div>
        <p class="prompt">${prompt}</p>
        <div class="buttons-container">
          <button class="nudge-btn continue-btn" disabled aria-disabled="true">Continue to Site</button>
          <button class="nudge-btn close-btn">Close Tab</button>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(overlay);
    document.documentElement.appendChild(this.shadowHost);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });
    });

    // Start countdown
    this.startTimer();

    // Setup button handlers
    this.setupEventHandlers();

    // Watch for accidental removal
    this.setupMutationObserver();
  }

  /**
   * Start the countdown timer
   */
  private startTimer(): void {
    if (!this.shadowRoot) return;

    let remaining = this.settings.pauseDuration;
    const timerEl = this.shadowRoot.querySelector('.timer');
    const continueBtn = this.shadowRoot.querySelector('.continue-btn') as HTMLButtonElement;

    this.timerInterval = window.setInterval(() => {
      remaining--;

      if (timerEl) {
        timerEl.textContent = remaining > 0 ? String(remaining) : '';
      }

      if (remaining <= 0) {
        this.clearTimer();

        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.removeAttribute('aria-disabled');
          continueBtn.classList.add('visible');
          continueBtn.focus();
        }
      }
    }, 1000);
  }

  /**
   * Clear the timer interval
   */
  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Setup button event handlers
   */
  private setupEventHandlers(): void {
    if (!this.shadowRoot) return;

    const continueBtn = this.shadowRoot.querySelector('.continue-btn');
    const closeBtn = this.shadowRoot.querySelector('.close-btn');

    continueBtn?.addEventListener('click', () => this.handleContinue());
    closeBtn?.addEventListener('click', () => this.handleClose());

    // Handle escape key
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.shadowHost) {
      this.handleClose();
    }
  };

  /**
   * Handle "Continue to Site" click
   */
  private async handleContinue(): Promise<void> {
    try {
      // Get current sessions
      const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
      const sessions: SessionData = result[STORAGE_KEYS.SESSIONS] || { ...DEFAULT_SESSION };

      // Unlock domain
      const unlockDuration = this.settings.unlockDuration * 60 * 1000;
      sessions.unlockedDomains[this.currentDomain] = Date.now() + unlockDuration;

      await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });

      // Update stats
      const statsResult = await chrome.storage.sync.get(STORAGE_KEYS.STATS);
      const stats: NudgeStats = statsResult[STORAGE_KEYS.STATS] || { ...DEFAULT_STATS };
      stats.intentionalVisits++;

      await chrome.storage.sync.set({ [STORAGE_KEYS.STATS]: stats });

      // Remove overlay
      this.removeOverlay();
    } catch {
      // Remove overlay even on error
      this.removeOverlay();
    }
  }

  /**
   * Handle "Close Tab" click
   */
  private async handleClose(): Promise<void> {
    try {
      // Update stats
      const result = await chrome.storage.sync.get(STORAGE_KEYS.STATS);
      const stats: NudgeStats = result[STORAGE_KEYS.STATS] || { ...DEFAULT_STATS };
      stats.temptationsResisted++;

      await chrome.storage.sync.set({ [STORAGE_KEYS.STATS]: stats });

      // Close tab via background script
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    } catch {
      // Try to close anyway
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    }
  }

  /**
   * Watch for overlay removal and re-inject if needed
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (node === this.shadowHost) {
            // Re-check and re-inject if still needed
            this.shouldShowNudge().then((shouldShow) => {
              if (shouldShow) {
                setTimeout(() => {
                  if (!document.getElementById('nudge-overlay-host')) {
                    this.shadowHost = null;
                    this.shadowRoot = null;
                    this.injectOverlay();
                  }
                }, 50);
              }
            });
            return;
          }
        }
      }
    });

    this.mutationObserver.observe(document.documentElement, { childList: true });
  }

  /**
   * Remove the overlay from the page
   */
  private removeOverlay(): void {
    // Clear timer
    this.clearTimer();

    // Disconnect observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove keydown listener
    document.removeEventListener('keydown', this.handleKeyDown);

    // Remove shadow host
    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }

    this.shadowHost = null;
    this.shadowRoot = null;

    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new NudgeOverlay().init());
} else {
  new NudgeOverlay().init();
}
