import { NudgeSettings, NudgeStats, DEFAULT_SETTINGS, DEFAULT_STATS } from './constants/types';

class OptionsPage {
  private settings: NudgeSettings = DEFAULT_SETTINGS;
  private stats: NudgeStats = DEFAULT_STATS;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    await this.loadStats();
    this.setupEventListeners();
    this.applyTheme();
    this.renderUI();
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('settings');
      if (result.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...result.settings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('stats');
      if (result.stats) {
        this.stats = { ...DEFAULT_STATS, ...result.stats };
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings: this.settings });
      this.showToast('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings');
    }
  }

  private async saveStats(): Promise<void> {
    try {
      await chrome.storage.sync.set({ stats: this.stats });
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  private applyTheme(): void {
    const theme = this.settings.theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', theme);
    }

    // Update active button
    document.querySelectorAll('.theme-option').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
  }

  private renderUI(): void {
    this.renderDomainList();
    this.renderSliders();
    this.renderStats();
  }

  private renderDomainList(): void {
    const container = document.getElementById('domainList');
    if (!container) return;

    container.innerHTML = '';

    this.settings.blacklist.forEach((domain) => {
      const tag = document.createElement('div');
      tag.className = 'domain-tag';
      tag.innerHTML = `
        <span>${domain}</span>
        <button class="remove-btn" data-domain="${domain}">×</button>
      `;
      container.appendChild(tag);
    });
  }

  private renderSliders(): void {
    const pauseSlider = document.getElementById('pauseSlider') as HTMLInputElement;
    const pauseValue = document.getElementById('pauseValue');
    const unlockSlider = document.getElementById('unlockSlider') as HTMLInputElement;
    const unlockValue = document.getElementById('unlockValue');

    if (pauseSlider && pauseValue) {
      pauseSlider.value = this.settings.pauseDuration.toString();
      pauseValue.textContent = `${this.settings.pauseDuration} seconds`;
    }

    if (unlockSlider && unlockValue) {
      unlockSlider.value = this.settings.unlockDuration.toString();
      unlockValue.textContent = `${this.settings.unlockDuration} minute${this.settings.unlockDuration !== 1 ? 's' : ''}`;
    }
  }

  private renderStats(): void {
    const resistedCount = document.getElementById('resistedCount');
    const intentionalCount = document.getElementById('intentionalCount');

    if (resistedCount) {
      resistedCount.textContent = this.stats.temptationsResisted.toString();
    }

    if (intentionalCount) {
      intentionalCount.textContent = this.stats.intentionalVisits.toString();
    }
  }

  private setupEventListeners(): void {
    // Add domain
    const addBtn = document.getElementById('addDomainBtn');
    const domainInput = document.getElementById('domainInput') as HTMLInputElement;

    addBtn?.addEventListener('click', () => this.addDomain());
    domainInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addDomain();
    });

    // Remove domain
    document.getElementById('domainList')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('remove-btn')) {
        const domain = target.getAttribute('data-domain');
        if (domain) this.removeDomain(domain);
      }
    });

    // Pause slider
    const pauseSlider = document.getElementById('pauseSlider') as HTMLInputElement;
    const pauseValue = document.getElementById('pauseValue');

    pauseSlider?.addEventListener('input', () => {
      const value = parseInt(pauseSlider.value);
      if (pauseValue) {
        pauseValue.textContent = `${value} seconds`;
      }
    });

    pauseSlider?.addEventListener('change', () => {
      this.settings.pauseDuration = parseInt(pauseSlider.value);
      this.saveSettings();
    });

    // Unlock slider
    const unlockSlider = document.getElementById('unlockSlider') as HTMLInputElement;
    const unlockValue = document.getElementById('unlockValue');

    unlockSlider?.addEventListener('input', () => {
      const value = parseInt(unlockSlider.value);
      if (unlockValue) {
        unlockValue.textContent = `${value} minute${value !== 1 ? 's' : ''}`;
      }
    });

    unlockSlider?.addEventListener('change', () => {
      this.settings.unlockDuration = parseInt(unlockSlider.value);
      this.saveSettings();
    });

    // Theme buttons
    document.querySelectorAll('.theme-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme') as 'light' | 'dark' | 'system';
        this.settings.theme = theme;
        this.applyTheme();
        this.saveSettings();
      });
    });

    // Reset stats
    document.getElementById('resetStatsBtn')?.addEventListener('click', () => {
      this.resetStats();
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.settings.theme === 'system') {
        this.applyTheme();
      }
    });

    // Listen for storage changes from other contexts
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        if (changes.stats) {
          this.stats = { ...DEFAULT_STATS, ...changes.stats.newValue };
          this.renderStats();
        }
      }
    });
  }

  private addDomain(): void {
    const input = document.getElementById('domainInput') as HTMLInputElement;
    if (!input) return;

    let domain = input.value.trim().toLowerCase();

    // Remove protocol and path
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    if (!domain) {
      this.showToast('Please enter a domain');
      return;
    }

    // Basic domain validation
    if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/.test(domain)) {
      this.showToast('Invalid domain format');
      return;
    }

    if (this.settings.blacklist.includes(domain)) {
      this.showToast('Domain already in list');
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
    if (!confirm('Are you sure you want to reset all statistics?')) {
      return;
    }

    this.stats = { ...DEFAULT_STATS };
    this.saveStats();
    this.renderStats();
    this.showToast('Statistics reset');
  }

  private showToast(message: string): void {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

// Initialize options page
new OptionsPage();
