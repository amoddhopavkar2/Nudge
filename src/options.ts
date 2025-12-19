/**
 * Nudge Options Page
 * Settings dashboard for user configuration
 */

import {
  NudgeSettings,
  NudgeStats,
  Theme,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  STORAGE_KEYS,
} from './types';
import { parseDomain, resolveTheme } from './utils';

/** Export data structure */
interface ExportData {
  version: string;
  exportedAt: string;
  settings: NudgeSettings;
  stats: NudgeStats;
}

class OptionsPage {
  private settings: NudgeSettings = { ...DEFAULT_SETTINGS };
  private stats: NudgeStats = { ...DEFAULT_STATS };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    this.applyTheme();
    this.render();
    this.setupEventListeners();
    this.listenForChanges();
  }

  private async loadData(): Promise<void> {
    const [settingsResult, statsResult] = await Promise.all([
      chrome.storage.sync.get(STORAGE_KEYS.SETTINGS),
      chrome.storage.sync.get(STORAGE_KEYS.STATS),
    ]);

    if (settingsResult[STORAGE_KEYS.SETTINGS]) {
      this.settings = { ...DEFAULT_SETTINGS, ...settingsResult[STORAGE_KEYS.SETTINGS] };
    }

    if (statsResult[STORAGE_KEYS.STATS]) {
      this.stats = { ...DEFAULT_STATS, ...statsResult[STORAGE_KEYS.STATS] };
    }
  }

  private async saveSettings(): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: this.settings });
    this.showToast('Settings saved');
  }

  private async saveStats(): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.STATS]: this.stats });
  }

  private applyTheme(): void {
    const resolved = resolveTheme(this.settings.theme);
    document.body.setAttribute('data-theme', resolved);

    document.querySelectorAll('.theme-option').forEach((btn) => {
      const btnTheme = btn.getAttribute('data-theme');
      btn.classList.toggle('active', btnTheme === this.settings.theme);
    });
  }

  private render(): void {
    this.renderDomainList();
    this.renderSliders();
    this.renderStats();
  }

  private renderDomainList(): void {
    const container = document.getElementById('domainList');
    if (!container) return;

    container.innerHTML = this.settings.blacklist
      .map(
        (domain) => `
        <span class="domain-tag">
          ${domain}
          <button data-domain="${domain}" aria-label="Remove ${domain}">×</button>
        </span>
      `
      )
      .join('');
  }

  private renderSliders(): void {
    const pauseSlider = document.getElementById('pauseSlider') as HTMLInputElement;
    const pauseValue = document.getElementById('pauseValue');
    const unlockSlider = document.getElementById('unlockSlider') as HTMLInputElement;
    const unlockValue = document.getElementById('unlockValue');

    if (pauseSlider && pauseValue) {
      pauseSlider.value = String(this.settings.pauseDuration);
      pauseValue.textContent = `${this.settings.pauseDuration}s`;
    }

    if (unlockSlider && unlockValue) {
      unlockSlider.value = String(this.settings.unlockDuration);
      unlockValue.textContent = `${this.settings.unlockDuration}m`;
    }
  }

  private renderStats(): void {
    const resistedEl = document.getElementById('resistedCount');
    const intentionalEl = document.getElementById('intentionalCount');

    if (resistedEl) resistedEl.textContent = String(this.stats.temptationsResisted);
    if (intentionalEl) intentionalEl.textContent = String(this.stats.intentionalVisits);
  }

  private setupEventListeners(): void {
    // Add domain
    document.getElementById('addDomainBtn')?.addEventListener('click', () => this.addDomain());
    document.getElementById('domainInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addDomain();
    });

    // Remove domain
    document.getElementById('domainList')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button[data-domain]');
      if (btn) {
        const domain = btn.getAttribute('data-domain');
        if (domain) this.removeDomain(domain);
      }
    });

    // Sliders
    const pauseSlider = document.getElementById('pauseSlider') as HTMLInputElement;
    const pauseValue = document.getElementById('pauseValue');

    pauseSlider?.addEventListener('input', () => {
      if (pauseValue) pauseValue.textContent = `${pauseSlider.value}s`;
    });

    pauseSlider?.addEventListener('change', () => {
      this.settings.pauseDuration = Number(pauseSlider.value);
      this.saveSettings();
    });

    const unlockSlider = document.getElementById('unlockSlider') as HTMLInputElement;
    const unlockValue = document.getElementById('unlockValue');

    unlockSlider?.addEventListener('input', () => {
      if (unlockValue) unlockValue.textContent = `${unlockSlider.value}m`;
    });

    unlockSlider?.addEventListener('change', () => {
      this.settings.unlockDuration = Number(unlockSlider.value);
      this.saveSettings();
    });

    // Theme
    document.querySelectorAll('.theme-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme') as Theme;
        this.settings.theme = theme;
        this.applyTheme();
        this.saveSettings();
      });
    });

    // Reset stats
    document.getElementById('resetStatsBtn')?.addEventListener('click', () => this.resetStats());

    // Export/Import
    document.getElementById('exportBtn')?.addEventListener('click', () => this.exportSettings());
    document.getElementById('importBtn')?.addEventListener('click', () => {
      document.getElementById('importFile')?.click();
    });
    document.getElementById('importFile')?.addEventListener('change', (e) => {
      this.importSettings(e);
    });

    // System theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.settings.theme === 'system') this.applyTheme();
    });
  }

  private listenForChanges(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      if (changes[STORAGE_KEYS.STATS]) {
        this.stats = { ...DEFAULT_STATS, ...changes[STORAGE_KEYS.STATS].newValue };
        this.renderStats();
      }
    });
  }

  private addDomain(): void {
    const input = document.getElementById('domainInput') as HTMLInputElement;
    if (!input) return;

    const domain = parseDomain(input.value);

    if (!domain) {
      this.showToast('Invalid domain');
      return;
    }

    if (this.settings.blacklist.includes(domain)) {
      this.showToast('Domain already added');
      return;
    }

    this.settings.blacklist.push(domain);
    this.renderDomainList();
    this.saveSettings();
    input.value = '';
  }

  private removeDomain(domain: string): void {
    this.settings.blacklist = this.settings.blacklist.filter((d) => d !== domain);
    this.renderDomainList();
    this.saveSettings();
  }

  private resetStats(): void {
    if (!confirm('Reset all statistics to zero?')) return;

    this.stats = { ...DEFAULT_STATS };
    this.saveStats();
    this.renderStats();
    this.showToast('Statistics reset');
  }

  private exportSettings(): void {
    const data: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.settings,
      stats: this.stats,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `nudge-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('Settings exported');
  }

  private async importSettings(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Validate structure
      if (!data.settings || !Array.isArray(data.settings.blacklist)) {
        throw new Error('Invalid file format');
      }

      // Merge with defaults to ensure all fields exist
      this.settings = { ...DEFAULT_SETTINGS, ...data.settings };

      if (data.stats) {
        this.stats = { ...DEFAULT_STATS, ...data.stats };
        await this.saveStats();
      }

      await this.saveSettings();
      this.applyTheme();
      this.render();
      this.showToast('Settings imported');
    } catch {
      this.showToast('Invalid settings file');
    }

    // Reset file input
    input.value = '';
  }

  private showToast(message: string): void {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2000);
  }
}

// Initialize
new OptionsPage();
