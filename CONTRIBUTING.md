# Contributing to Nudge

Thank you for your interest in contributing to Nudge! This document provides guidelines for contributing to the project.

## Philosophy

Nudge is a tool for digital minimalism. When contributing, keep these principles in mind:

1. **Simplicity over features** — Resist adding complexity. Every feature should serve the core mission of mindful browsing.
2. **Privacy is non-negotiable** — No analytics, no tracking, no external requests.
3. **Performance matters** — The content script runs on every page. Keep it lightweight.
4. **Accessibility** — Support keyboard navigation, screen readers, and reduced motion preferences.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/user/nudge.git
cd nudge

# Install dependencies
npm install

# Build the extension
npm run build

# Load dist/ folder in chrome://extensions
```

### Development

```bash
# Development build (no minification, with sourcemaps)
npm run dev

# Production build (minified, no console logs)
npm run build:prod

# Type checking
npm run typecheck
```

## Project Structure

```
src/
├── background.ts      # Service worker
├── content.ts         # Overlay injection
├── options.html       # Settings page
├── options.ts         # Settings logic
├── types/
│   └── index.ts       # TypeScript interfaces
├── utils/
│   └── index.ts       # Shared utilities
└── constants/
    └── prompts.ts     # Mindful prompts
```

## Ways to Contribute

### Adding Mindful Prompts

The easiest way to contribute! Edit `src/constants/prompts.ts`:

```typescript
export const MINDFUL_PROMPTS: readonly string[] = [
  // Existing prompts...
  'Your new prompt here',
];
```

Guidelines for prompts:
- Keep them short (under 60 characters ideal)
- Use a questioning or reflective tone
- Avoid judgment — encourage awareness, not guilt
- Test that they feel appropriate in the breathing pause context

### Bug Fixes

1. Check existing issues first
2. Create a minimal reproduction case
3. Submit a PR with a clear description

### New Features

Before implementing:
1. Open an issue to discuss the feature
2. Explain how it supports mindful browsing
3. Consider if it adds necessary complexity

Features we're unlikely to accept:
- Integrations with external services
- Features requiring new permissions
- Gamification (streaks, achievements, etc.)
- Social features

Features we'd consider:
- Accessibility improvements
- Performance optimizations
- UI/UX refinements
- Localization support

## Code Style

- TypeScript strict mode
- No `any` types
- Meaningful variable names
- Document complex logic with comments
- Use async/await over raw promises

## Testing

Currently, testing is manual:
1. Build the extension
2. Load in Chrome
3. Verify the overlay appears on blacklisted sites
4. Test settings persistence
5. Test across light/dark themes

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run `npm run typecheck`
5. Test thoroughly
6. Commit with clear messages
7. Push and create a PR

PR titles should follow:
- `feat: add new feature`
- `fix: resolve issue with X`
- `docs: update README`
- `refactor: improve X`

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Welcome newcomers
- Assume good intentions

## Questions?

Open an issue with the `question` label.

---

Thank you for helping make Nudge better!
