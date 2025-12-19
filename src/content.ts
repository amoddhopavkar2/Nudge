import { MINDFUL_PROMPTS } from './constants/prompts';
import { NudgeSettings, DEFAULT_SETTINGS } from './constants/types';

// Inline CSS to avoid external file loading issues
const OVERLAY_CSS = `
:host {
  all: initial;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.nudge-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: opacity 0.3s ease-out;
  overflow: hidden;
}

.nudge-overlay.theme-light {
  background: rgba(250, 250, 250, 0.97);
  color: #2d3748;
}

.nudge-overlay.theme-dark {
  background: rgba(26, 32, 44, 0.98);
  color: #e2e8f0;
}

.nudge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  max-width: 480px;
  padding: 3rem;
  text-align: center;
}

.breathing-circle-container {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breathing-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  animation: breathe 8s ease-in-out infinite;
}

.theme-light .breathing-circle {
  background: linear-gradient(135deg, #81e6d9 0%, #4fd1c5 50%, #38b2ac 100%);
  box-shadow: 0 0 60px rgba(79, 209, 197, 0.4);
}

.theme-dark .breathing-circle {
  background: linear-gradient(135deg, #4fd1c5 0%, #319795 50%, #2c7a7b 100%);
  box-shadow: 0 0 60px rgba(79, 209, 197, 0.3);
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.timer {
  position: absolute;
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.theme-light .timer {
  color: #2d3748;
}

.theme-dark .timer {
  color: #f7fafc;
}

.prompt {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.6;
  max-width: 400px;
  opacity: 0.9;
}

.theme-light .prompt {
  color: #4a5568;
}

.theme-dark .prompt {
  color: #cbd5e0;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 280px;
}

.nudge-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nudge-btn:focus {
  outline: none;
}

.nudge-btn:focus-visible {
  outline: 2px solid #4fd1c5;
  outline-offset: 2px;
}

.continue-btn {
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.4s ease;
}

.continue-btn.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.theme-light .continue-btn {
  background: linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(79, 209, 197, 0.3);
}

.theme-light .continue-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(79, 209, 197, 0.4);
  transform: translateY(-2px);
}

.theme-dark .continue-btn {
  background: linear-gradient(135deg, #319795 0%, #2c7a7b 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(49, 151, 149, 0.3);
}

.theme-dark .continue-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(49, 151, 149, 0.4);
  transform: translateY(-2px);
}

.close-btn {
  background: transparent;
  border: 2px solid currentColor;
  opacity: 0.7;
}

.theme-light .close-btn {
  color: #718096;
}

.theme-light .close-btn:hover {
  background: rgba(113, 128, 150, 0.1);
  opacity: 1;
}

.theme-dark .close-btn {
  color: #a0aec0;
}

.theme-dark .close-btn:hover {
  background: rgba(160, 174, 192, 0.1);
  opacity: 1;
}

.breathing-text {
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
  animation: breatheText 8s ease-in-out infinite;
}

@keyframes breatheText {
  0%, 100% {
    opacity: 0.6;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  75% {
    opacity: 1;
  }
}

.nudge-overlay.entering {
  opacity: 0;
}

.nudge-overlay.entered {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .breathing-circle {
    animation: none;
    transform: scale(1.25);
    opacity: 0.9;
  }

  .breathing-text {
    animation: none;
    opacity: 0.8;
  }

  .nudge-overlay,
  .continue-btn {
    transition: none;
  }
}
`;

class NudgeOverlay {
  private shadowHost: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private timerInterval: number | null = null;
  private settings: NudgeSettings = DEFAULT_SETTINGS;
  private currentDomain: string;
  private observer: MutationObserver | null = null;

  constructor() {
    this.currentDomain = this.extractDomain(window.location.hostname);
  }

  private extractDomain(hostname: string): string {
    // Remove www. prefix and get base domain
    return hostname.replace(/^www\./, '').toLowerCase();
  }

  private getRandomPrompt(): string {
    const index = Math.floor(Math.random() * MINDFUL_PROMPTS.length);
    return MINDFUL_PROMPTS[index];
  }

  private getTheme(): 'light' | 'dark' {
    if (this.settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.settings.theme;
  }

  async init(): Promise<void> {
    try {
      // Load settings
      const result = await chrome.storage.sync.get('settings');
      if (result.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...result.settings };
      }

      // Check if domain should be nudged
      const shouldNudge = await this.shouldShowNudge();

      if (shouldNudge) {
        this.createOverlay();
      }

      // Listen for storage changes
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.settings) {
          this.settings = { ...DEFAULT_SETTINGS, ...changes.settings.newValue };
        }
        if (areaName === 'local' && changes.sessions) {
          // Re-check if we should show nudge when sessions change
          this.checkAndUpdateOverlay();
        }
      });
    } catch (error) {
      console.error('Nudge: Failed to initialize', error);
    }
  }

  private async shouldShowNudge(): Promise<boolean> {
    // Check if current domain is in blacklist
    const isBlacklisted = this.settings.blacklist.some((domain) => {
      const normalizedBlacklist = domain.toLowerCase().replace(/^www\./, '');
      return this.currentDomain === normalizedBlacklist ||
             this.currentDomain.endsWith('.' + normalizedBlacklist);
    });

    if (!isBlacklisted) {
      return false;
    }

    // Check if domain is currently unlocked
    try {
      const result = await chrome.storage.local.get('sessions');
      const sessions = result.sessions || { unlockedDomains: {} };
      const unlockExpiry = sessions.unlockedDomains[this.currentDomain];

      if (unlockExpiry && Date.now() < unlockExpiry) {
        return false; // Domain is unlocked
      }
    } catch (error) {
      console.error('Nudge: Failed to check session', error);
    }

    return true;
  }

  private async checkAndUpdateOverlay(): Promise<void> {
    const shouldNudge = await this.shouldShowNudge();

    if (shouldNudge && !this.shadowHost) {
      this.createOverlay();
    } else if (!shouldNudge && this.shadowHost) {
      this.removeOverlay();
    }
  }

  private createOverlay(): void {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Create shadow host
    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'nudge-shadow-host';
    this.shadowHost.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
    `;

    // Create shadow root (closed mode makes it harder to inspect)
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'closed' });

    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = OVERLAY_CSS;
    this.shadowRoot.appendChild(styleElement);

    // Create overlay content
    const theme = this.getTheme();
    const prompt = this.getRandomPrompt();

    const overlay = document.createElement('div');
    overlay.className = `nudge-overlay theme-${theme} entering`;
    overlay.innerHTML = `
      <div class="nudge-container">
        <div class="breathing-text">Breathe</div>
        <div class="breathing-circle-container">
          <div class="breathing-circle"></div>
          <div class="timer">${this.settings.pauseDuration}</div>
        </div>
        <p class="prompt">${prompt}</p>
        <div class="buttons-container">
          <button class="nudge-btn continue-btn" disabled>Continue to Site</button>
          <button class="nudge-btn close-btn">Close Tab</button>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(overlay);
    document.documentElement.appendChild(this.shadowHost);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      overlay.classList.remove('entering');
      overlay.classList.add('entered');
    });

    // Start timer
    this.startTimer();

    // Set up button handlers
    this.setupButtonHandlers();

    // Set up re-injection observer (makes overlay robust against accidental removal)
    this.setupReinjectionObserver();
  }

  private setupReinjectionObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode === this.shadowHost) {
            // Re-check if we should show the nudge
            this.shouldShowNudge().then((shouldNudge) => {
              if (shouldNudge) {
                // Small delay to prevent infinite loops
                setTimeout(() => {
                  if (!document.getElementById('nudge-shadow-host')) {
                    this.createOverlay();
                  }
                }, 100);
              }
            });
            return;
          }
        }
      }
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: false,
    });
  }

  private startTimer(): void {
    if (!this.shadowRoot) return;

    let timeLeft = this.settings.pauseDuration;
    const timerElement = this.shadowRoot.querySelector('.timer');
    const continueBtn = this.shadowRoot.querySelector('.continue-btn') as HTMLButtonElement;

    this.timerInterval = window.setInterval(() => {
      timeLeft--;

      if (timerElement) {
        timerElement.textContent = timeLeft.toString();
      }

      if (timeLeft <= 0) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }

        if (timerElement) {
          timerElement.textContent = '';
        }

        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.classList.add('visible');
        }
      }
    }, 1000);
  }

  private setupButtonHandlers(): void {
    if (!this.shadowRoot) return;

    const continueBtn = this.shadowRoot.querySelector('.continue-btn');
    const closeBtn = this.shadowRoot.querySelector('.close-btn');

    continueBtn?.addEventListener('click', () => this.handleContinue());
    closeBtn?.addEventListener('click', () => this.handleCloseTab());
  }

  private async handleContinue(): Promise<void> {
    try {
      // Unlock domain for the configured duration
      const result = await chrome.storage.local.get('sessions');
      const sessions = result.sessions || { unlockedDomains: {} };

      const unlockDurationMs = this.settings.unlockDuration * 60 * 1000;
      sessions.unlockedDomains[this.currentDomain] = Date.now() + unlockDurationMs;

      await chrome.storage.local.set({ sessions });

      // Increment intentional visits stat
      const statsResult = await chrome.storage.sync.get('stats');
      const stats = statsResult.stats || { temptationsResisted: 0, intentionalVisits: 0 };
      stats.intentionalVisits++;
      await chrome.storage.sync.set({ stats });

      // Remove overlay
      this.removeOverlay();
    } catch (error) {
      console.error('Nudge: Failed to handle continue', error);
      // Still remove overlay even if storage fails
      this.removeOverlay();
    }
  }

  private async handleCloseTab(): Promise<void> {
    try {
      // Increment temptations resisted stat
      const statsResult = await chrome.storage.sync.get('stats');
      const stats = statsResult.stats || { temptationsResisted: 0, intentionalVisits: 0 };
      stats.temptationsResisted++;
      await chrome.storage.sync.set({ stats });

      // Send message to background to close tab
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    } catch (error) {
      console.error('Nudge: Failed to handle close tab', error);
      // Try to close anyway
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    }
  }

  private removeOverlay(): void {
    // Clear timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove shadow host
    if (this.shadowHost && this.shadowHost.parentNode) {
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
  document.addEventListener('DOMContentLoaded', () => {
    const nudge = new NudgeOverlay();
    nudge.init();
  });
} else {
  const nudge = new NudgeOverlay();
  nudge.init();
}
