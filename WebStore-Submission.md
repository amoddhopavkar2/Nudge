# Chrome Web Store Submission Guide

This document contains all information needed for submitting Nudge to the Chrome Web Store.

---

## Store Listing

### Extension Name
```
Nudge - Mindful Browsing
```

### Short Description (132 characters max)
```
A 10-second breathing pause for distracting websites. Break the scroll habit with intentional friction, not hard blocks.
```

### Detailed Description
```
Nudge introduces intentional friction to break the cycle of impulsive browsing.

HOW IT WORKS
When you visit a site on your blocklist (Twitter, Reddit, TikTok, etc.), Nudge shows a calming full-screen overlay with a breathing animation. After 10 seconds, you can choose to continue or close the tab.

This isn't about blocking. It's about awareness.

WHY FRICTION WORKS
Modern apps are designed to be frictionless—one tap and you're scrolling. This removes the space between impulse and action. Nudge restores that space with a simple question: "Is this a conscious choice?"

Often, 10 seconds is all it takes. The urge passes. You remember what you were trying to do. And if you still want to continue? That's fine—now it's a decision, not a reflex.

FEATURES
• Breathing animation with mindful prompts
• Customizable pause duration (5-30 seconds)
• Session unlock (continue for 15 minutes, then pause again)
• Track "temptations resisted" vs "intentional visits"
• Export/import settings between devices
• True dark mode for OLED screens
• Keyboard accessible

PRIVACY FIRST
Nudge collects zero data. No analytics. No tracking. No network requests. Everything stays on your device. Period.

We can't see your browsing habits because that data never reaches us.

CUSTOMIZABLE BLOCKLIST
Comes with common time-sink sites pre-configured. Add your own or remove any from the list. Your blocklist, your rules.

OPEN SOURCE
Full source code available on GitHub. Audit it yourself.

---
Made for people who want to reclaim their attention, not restrict it.
```

### Category
```
Productivity
```

### Language
```
English
```

---

## Screenshots

Prepare the following screenshots (1280x800 or 640x400):

1. **Overlay - Dark Mode**
   - Show the breathing circle overlay on twitter.com
   - Timer visible, prompt visible

2. **Overlay - Light Mode**
   - Same as above but in light mode

3. **Settings Page - Dark Mode**
   - Show the full settings page
   - Include some blocked domains

4. **Settings Page - Statistics**
   - Show the statistics section with some data

5. **Before/After**
   - Split image showing the site blocked vs. continuing

---

## Promotional Images

### Small Tile (440x280)
- Nudge logo + tagline "Breathe before you scroll"
- Minimal, clean design

### Large Tile (920x680)
- Show the breathing circle animation
- Include key features as bullet points

### Marquee (1400x560)
- Hero image with the overlay in action
- "Intentional friction for mindful browsing"

---

## Justification for Permissions

| Permission | Justification |
|------------|---------------|
| `storage` | Required to save user settings (blocklist, preferences) and statistics locally on the device. No data is transmitted externally. |
| `alarms` | Required to automatically clean up expired session data (when unlocked domains expire). Runs once per minute. |
| `tabs` | Required to close the current tab when user clicks "Close Tab" in the overlay. Only used on explicit user action. |

### Host Permissions
```
None required. The content script uses manifest-declared matches only.
```

---

## Privacy Practices

For the Chrome Web Store privacy disclosure:

### Data Use Certification

**Does the extension collect user data?**
No

**Does the extension handle personal communications?**
No

**Does the extension handle financial/payment information?**
No

**Does the extension handle authentication information?**
No

**Does the extension handle location data?**
No

**Does the extension handle web history?**
No (the extension sees URLs to check against blocklist but does not record or transmit them)

**Does the extension handle user activity?**
Limited local statistics only (blocked count, continued count). Never transmitted.

### Privacy Policy URL
```
[Link to PRIVACY.md on GitHub or hosted version]
```

---

## Support Information

### Support Email
```
[your-email@example.com]
```

### Support URL
```
https://github.com/user/nudge/issues
```

---

## Single Purpose Description

```
Nudge has a single purpose: to introduce a breathing pause when users visit self-defined distracting websites, helping them make conscious browsing choices. All features (timer settings, statistics, theme options) directly support this core functionality.
```

---

## Review Notes for Google

```
Hi reviewers,

Nudge is a digital wellness tool that shows a breathing pause overlay when users visit websites they've added to their personal blocklist.

Key points for review:
1. The content script only activates on sites the user has explicitly added to their blocklist
2. No data is collected or transmitted—everything is local
3. The overlay uses Shadow DOM to avoid style conflicts with host pages
4. Users can always continue to the site after the pause—this is not a hard blocker

Test the extension:
1. Install and open settings
2. Default sites include twitter.com, reddit.com, etc.
3. Visit any blocked site to see the overlay
4. Wait 10 seconds, then "Continue" or "Close Tab"

Thank you for reviewing!
```

---

## Version History

### 1.0.0 (Initial Release)
- Breathing pause overlay with customizable duration
- Mindful prompts
- Session unlock feature
- Statistics tracking
- Export/import settings
- Light/Dark/System themes
- Full keyboard accessibility
