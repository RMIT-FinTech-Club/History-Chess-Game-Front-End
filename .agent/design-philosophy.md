Design Philosophy
Aesthetic Direction: Historical Cinematic

Building on the existing dark theme with gold accents, we'll create a more immersive, premium experience that feels like stepping into a historical epic. The design will evoke the grandeur of ancient battles and strategic mastery.

Key Design Principles:

Layered Depth: Multiple visual layers with gradients, glows, and overlapping elements
Rich Iconography: Strategic use of chess-themed and historical icons
Cinematic Motion: Purposeful animations that reveal content dramatically
Consistent Content: Replace placeholder text with meaningful, thematic content
Premium Glass Effects: Enhanced glassmorphism with gold reflections

---

## Typography System

The application uses a carefully curated font hierarchy that evokes historical grandeur:

### Font Family Guide

| Usage                | Class            | Font Family           | Description                                    |
|---------------------|------------------|----------------------|------------------------------------------------|
| **Display/Titles**  | `font-display`   | Cinzel Decorative    | Ornate, decorative font for major headings    |
| **Headings/Labels** | `font-serif`     | Cinzel               | Elegant serif for section titles and labels   |
| **Body Text**       | `font-sans`      | Poppins              | Clean, modern sans-serif for readability     |
| **Alternative**     | `font-heading`   | Playfair Display     | Italic-friendly serif for quotes/emphasis    |

### Usage Patterns

```tsx
// Major Page Titles - Use font-display
<h1 className="font-display text-2xl md:text-3xl gold-gradient-text">
    PLAY ONLINE
</h1>

// Section Headings - Use font-display or font-serif
<h2 className="font-display text-xl text-gold-light">Statistics</h2>

// Labels and Categories - Use font-serif with smaller size
<label className="font-serif text-sm text-white/60 uppercase tracking-wider">
    Opponent
</label>

// Descriptive/Supporting Text - Use font-serif
<p className="font-serif text-sm text-gray-400">Player since 2024</p>

// Body content, UI elements - Use default (font-sans) or explicit font-sans
<span className="font-sans text-xs uppercase tracking-wider">Level 5</span>

// Numbers and Stats - Use font-display for emphasis
<p className="font-display text-3xl text-gold-shimmer">1,234</p>
```

### Gold Text Effects

```tsx
// Animated gold shimmer gradient text
<span className="gold-gradient-text">Premium Text</span>

// Gold text shadow
<span className="text-gold-royal text-shadow-gold">Glowing Text</span>

// Gold highlight color
<span className="text-gold-highlight">Highlighted</span>
```

---

## Color Palette

### Gold/Yellow Spectrum
- `gold-main` (#E8BB05) - Primary gold
- `gold-dark` (#B98F00) - Darker gold
- `gold-deep` (#7A651C) - Deepest gold
- `gold-light` (#DDBA68) - Light gold
- `gold-royal` (#D4AF37) - Royal/antique gold
- `gold-shimmer` (#F4D03F) - Bright shimmer gold
- `gold-highlight` (#E9B654) - Highlight gold

### Background Colors
- `bg-app` (#151515) - Main app background
- `bg-dark` (#0a0a0a) - Darkest background
- `bg-card` (rgba(30, 30, 30, 0.6)) - Card backgrounds