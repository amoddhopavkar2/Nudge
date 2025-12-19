# Nudge

A Chrome extension that introduces **intentional friction** to break the cycle of impulsive browsing and doomscrolling.

## The Philosophy of Intentional Friction

Modern apps are designed to be frictionless. One tap opens Twitter. One swipe reveals TikTok. This seamlessness is intentional—it maximizes engagement by removing every barrier between you and endless content.

**Nudge takes the opposite approach.**

Instead of hard-blocking distracting websites (which often leads to frustration and workarounds), Nudge introduces a **mindful pause**—a 10-second breathing exercise that creates space between impulse and action.

This friction isn't about restriction. It's about **awareness**.

When you visit a blacklisted site, Nudge asks you to:
- Take a deep breath
- Reflect on why you're here
- Make a conscious choice

Often, that's all it takes. The urge passes. You remember what you were actually trying to do. And if you still want to continue? That's fine—at least it's now a deliberate decision, not a reflex.

## Features

- **Breathing Overlay**: A calming full-screen pause with an animated breathing circle
- **Mindful Prompts**: Randomized questions to encourage self-reflection
- **Session Unlock**: After pausing, the site unlocks for a configurable duration (default: 15 minutes)
- **Customizable Timer**: Set the pause duration from 5 to 30 seconds
- **Dark & Light Themes**: Respects your system preference or manual choice
- **Statistics**: Track your "temptations resisted" vs "intentional visits"
- **100% Private**: All data stays local. No telemetry. No external APIs.

## Installation

### From Source (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/yourusername/nudge.git
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
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

5. The options page will open automatically. Add your distracting sites!

### Development Mode

For active development with hot-reload watching:

```bash
npm run dev
```

This watches for changes and rebuilds automatically. You'll still need to click the reload button on `chrome://extensions/` to see changes.

## Default Blacklist

Nudge comes pre-configured with common time-sink sites:
- twitter.com / x.com
- facebook.com
- instagram.com
- reddit.com
- tiktok.com
- youtube.com

You can add or remove sites from the options page.

## How It Works

1. When you navigate to a blacklisted domain, Nudge injects a full-screen overlay
2. The overlay uses Shadow DOM to prevent CSS conflicts with the host site
3. A 10-second timer counts down while you practice box breathing
4. After the timer, you can choose to:
   - **Continue**: The site unlocks for 15 minutes (configurable)
   - **Close Tab**: The tab closes and your "temptations resisted" stat increases
5. Session data is stored locally to remember your unlocked sites

## Project Structure

```
nudge/
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   └── icons/             # Extension icons
├── src/
│   ├── background.ts      # Service worker for session management
│   ├── content.ts         # Overlay injection and timer logic
│   ├── options.html       # Settings page HTML
│   ├── options.ts         # Settings page logic
│   ├── constants/
│   │   ├── prompts.ts     # Mindful prompts array
│   │   └── types.ts       # TypeScript type definitions
│   └── styles/
│       └── overlay.css    # Overlay styles (Zen aesthetic)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Technical Details

- **Manifest V3**: Uses the latest Chrome extension architecture
- **TypeScript**: Full type safety across all modules
- **Vite**: Fast, modern build tooling
- **Shadow DOM**: Isolates overlay styles from host pages
- **Storage API**:
  - `storage.sync`: Settings and statistics (synced across devices)
  - `storage.local`: Session data (device-specific)

## Customization

### Adding Custom Prompts

Edit `src/constants/prompts.ts` to add your own mindful prompts:

```typescript
export const MINDFUL_PROMPTS: string[] = [
  "Is this a conscious choice?",
  "Your custom prompt here",
  // ...
];
```

### Styling

The overlay uses a "Zen" aesthetic with:
- Soft teal accents (#4FD1C5)
- Clean sans-serif typography (Inter, system fonts)
- Subtle animations and shadows
- Full dark mode support

Modify `src/styles/overlay.css` or the inline styles in `content.ts`.

## Privacy

Nudge is designed with privacy as a core principle:

- **No tracking**: Zero analytics or telemetry
- **No network requests**: Everything runs locally
- **No accounts**: Your data never leaves your device
- **Open source**: Audit the code yourself

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your experience with intentional friction

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*"Between stimulus and response there is a space. In that space is our power to choose our response."*
— Viktor Frankl
