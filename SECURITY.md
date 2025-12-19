# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Nudge, please report it responsibly.

### How to Report

**Do NOT open a public issue for security vulnerabilities.**

Instead:
1. Email: [security@example.com] (replace with actual contact)
2. Or: Open a private security advisory on GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 7 days
- **Resolution:** Depends on severity, typically within 30 days

## Scope

### In Scope

- Content script injection vulnerabilities
- Data exposure from storage APIs
- Cross-site scripting in the options page
- Bypass of the overlay mechanism
- Permission escalation

### Out of Scope

- Social engineering attacks
- Physical access attacks
- Browser vulnerabilities (report to Chrome)
- Denial of service on local machine

## Security Design

Nudge is designed with security in mind:

### Minimal Permissions

We only request:
- `storage` — Local data persistence
- `alarms` — Session cleanup
- `tabs` — Tab closing functionality

We explicitly avoid:
- `webRequest` — No network interception
- `cookies` — No cookie access
- `history` — No browsing history
- `<all_urls>` host permissions — No arbitrary page access

### Content Script Isolation

- Shadow DOM with `mode: 'closed'`
- No external resource loading
- No `eval()` or dynamic code execution
- No inline event handlers (CSP compatible)

### Data Handling

- All data stored locally
- No encryption needed (no sensitive data transmitted)
- No PII collected
- User can export/delete all data

### Build Security

- Dependencies audited with `npm audit`
- No build-time code injection
- Reproducible builds

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Updates

Security patches are released as soon as possible after verification. Users are encouraged to keep the extension updated.

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities. Contributors will be acknowledged (with permission) in release notes.
