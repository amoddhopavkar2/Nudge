# Nudge

**Intentional friction for mindful browsing.**

Nudge is a Chrome extension that introduces a 10-second breathing pause when you visit distracting websites. Instead of hard-blocking sites (which leads to frustration and workarounds), Nudge creates space for conscious choice.

## Why Nudge?

Modern apps are designed to be frictionless. One tap opens Twitter. One swipe reveals TikTok. This seamlessness is intentional—it maximizes engagement by removing every barrier between impulse and action.

**Nudge takes the opposite approach.**

When you visit a site on your blocklist, Nudge doesn't stop you. It simply asks you to breathe for 10 seconds. In that pause:

- The urge often passes
- You remember what you were actually trying to do
- If you still want to continue, you can—but now it's a decision, not a reflex

This is **intentional friction**: small barriers that interrupt autopilot behavior and restore agency.

## Features

- **Breathing Overlay** — Full-screen pause with animated breathing circle
- **Mindful Prompts** — Randomized reflective questions
- **Session Unlock** — Continue access for 15 minutes (configurable)
- **Statistics** — Track "temptations resisted" vs "intentional visits"
- **Export/Import** — Transfer your settings between devices
- **Dark Mode** — True black theme for OLED displays
- **100% Private** — All data stays on your device

## Privacy First

Nudge is built on a simple principle: **your data belongs to you**.

- Zero data collection
- Zero network requests
- Zero analytics
- Zero tracking

Everything is stored locally. We can't see your data because it never reaches us.

[Read our full Privacy Policy →](PRIVACY.md)

## Installation

### Chrome Web Store

Coming soon.

### Developer Mode

1. Clone the repository:
   ```bash
   git clone https://github.com/user/nudge.git
   cd nudge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Development

```bash
# Development build
npm run dev

# Production build (minified)
npm run build:prod

# Type checking
npm run typecheck

# Generate icons
npm run icons
```

## Project Structure

```
src/
├── background.ts      # Service worker for session management
├── content.ts         # Overlay injection and timer
├── options.html       # Settings page UI
├── options.ts         # Settings page logic
├── types/
│   └── index.ts       # TypeScript interfaces
├── utils/
│   └── index.ts       # Shared utilities
└── constants/
    └── prompts.ts     # Mindful prompts
```

## Default Blocklist

Nudge comes pre-configured with common time-sink sites:

- twitter.com / x.com
- facebook.com
- instagram.com
- reddit.com
- tiktok.com
- youtube.com

Customize your list in the settings page.

## Configuration

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Pause Duration | 5-30s | 10s | How long to breathe before continuing |
| Unlock Duration | 1-60m | 15m | How long the site stays unlocked |
| Theme | Light/Dark/System | System | UI appearance |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

Easy first contributions:
- Add new mindful prompts in `src/constants/prompts.ts`
- Improve accessibility
- Fix typos in documentation

## Security

Found a vulnerability? Please report it responsibly. See [SECURITY.md](SECURITY.md).

## License

MIT License. See [LICENSE](LICENSE) for details.

---

*"Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom."*

— Viktor Frankl
