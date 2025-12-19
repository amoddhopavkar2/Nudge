/**
 * Nudge Extension Utilities
 * Shared helper functions used across the extension
 */

/**
 * Extracts the base domain from a hostname
 * Removes 'www.' prefix and converts to lowercase
 * @param hostname - The hostname to normalize (e.g., 'www.Twitter.com')
 * @returns Normalized domain (e.g., 'twitter.com')
 */
export function normalizeDomain(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

/**
 * Parses a URL or domain string and extracts the base domain
 * Handles full URLs, domains with protocols, and plain domains
 * @param input - URL or domain string
 * @returns Normalized domain or empty string if invalid
 */
export function parseDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) return '';

  // Remove protocol if present
  let domain = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Remove path, query, and hash
  domain = domain.split('/')[0].split('?')[0].split('#')[0];

  // Basic domain validation
  if (!isValidDomain(domain)) return '';

  return domain;
}

/**
 * Validates a domain string format
 * @param domain - Domain to validate
 * @returns True if domain appears valid
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 3) return false;

  // Must contain at least one dot
  if (!domain.includes('.')) return false;

  // Basic regex for domain validation
  const domainRegex = /^[a-z0-9]+([-.]?[a-z0-9]+)*\.[a-z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Checks if a domain matches any entry in the blacklist
 * Supports exact matches and subdomain matching
 * @param domain - The domain to check (normalized)
 * @param blacklist - Array of blacklisted domains
 * @returns True if domain is blacklisted
 */
export function isDomainBlacklisted(domain: string, blacklist: string[]): boolean {
  const normalizedDomain = normalizeDomain(domain);

  return blacklist.some((blockedDomain) => {
    const normalizedBlocked = normalizeDomain(blockedDomain);

    // Exact match
    if (normalizedDomain === normalizedBlocked) return true;

    // Subdomain match (e.g., 'm.twitter.com' matches 'twitter.com')
    if (normalizedDomain.endsWith('.' + normalizedBlocked)) return true;

    return false;
  });
}

/**
 * Checks if a domain is currently in an unlocked session
 * @param domain - The domain to check
 * @param unlockedDomains - Map of domain -> expiry timestamp
 * @returns True if domain is unlocked and session hasn't expired
 */
export function isDomainUnlocked(
  domain: string,
  unlockedDomains: Record<string, number>
): boolean {
  const normalizedDomain = normalizeDomain(domain);
  const expiry = unlockedDomains[normalizedDomain];

  if (!expiry) return false;

  return Date.now() < expiry;
}

/**
 * Gets the resolved theme based on user preference
 * @param theme - User's theme preference
 * @returns 'light' or 'dark'
 */
export function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Formats a duration in minutes for display
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "15 minutes", "1 minute")
 */
export function formatMinutes(minutes: number): string {
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Formats a duration in seconds for display
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "10 seconds", "1 second")
 */
export function formatSeconds(seconds: number): string {
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Creates a debounced version of a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
