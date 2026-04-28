# Majed Almasmoum — Design System
**معرض ماجد المصموم**

## Overview
Majed Almasmoum is a luxury 3D-printed art gallery and studio. The brand bridges the worlds of fine art and cutting-edge fabrication — offering bespoke three-dimensional sculptural prints as collectible or decorative artworks. The portfolio site serves as both a gallery experience and a commission inquiry platform.

**Sources provided:**
- Logo: `assets/logo.jpeg` (JPEG, uploaded by client)
- No codebase or Figma link provided — design system built from logo analysis and brand brief.

---

## Products / Surfaces
| Surface | Description |
|---|---|
| **Gallery Portfolio Site** | Bilingual (AR/EN) artist portfolio showcasing 3D printed works, with inquiry/commission flow |

---

## CONTENT FUNDAMENTALS

**Language:** Bilingual — Arabic (RTL primary) + English (LTR secondary). Arabic leads on hero text; English mirrors beneath.

**Tone:** Refined, confident, minimal. The brand speaks like an artist-curator — never salesy. Sentences are short and declarative.

**Casing:**
- English headings: Title Case or ALL CAPS for labels/categories
- Arabic: Natural sentence casing (no ALL CAPS in Arabic)
- Brand name in English: "MAJED ALMASMOUM" (small caps / all caps wordmark)

**Voice:**
- First person singular: "أعمالي" (my works), "فلسفتي" (my philosophy)
- Direct and confident: no filler, no corporate-speak
- English: "Commission a piece." not "You can commission a piece today."

**Emoji:** Never used. Brand is too refined.

**Copy examples:**
- "طباعة تحول المادة إلى فن." → "Printing that transforms matter into art."
- "كل قطعة، قصة." → "Every piece, a story."
- "اطلب عملك الخاص" → "Commission your piece"

---

## VISUAL FOUNDATIONS

### Colors
| Token | Hex | Use |
|---|---|---|
| `--crimson` | `#8C1A1A` | Brand accent, primary CTA, monogram |
| `--crimson-light` | `#B22222` | Hover state on crimson |
| `--gold` | `#C9A96E` | Secondary accent, borders, highlights |
| `--gold-muted` | `#9A7A4A` | Subtle gold, dividers |
| `--bg-void` | `#0A0A0A` | Page background |
| `--bg-surface` | `#141414` | Card / panel backgrounds |
| `--bg-elevated` | `#1E1C1C` | Elevated surfaces, modals |
| `--fg-primary` | `#F5F0E8` | Main body text (warm white) |
| `--fg-secondary` | `#A09A90` | Secondary / muted text |
| `--fg-tertiary` | `#5A5450` | Placeholder, disabled |
| `--border` | `#2A2724` | Subtle borders |

### Typography
**Display / Headings:** Cormorant Garamond (serif) — editorial, high-end
**Body / UI:** DM Sans (sans-serif) — modern, legible
**Arabic Display:** Noto Serif Arabic — pairs with Cormorant Garamond
**Arabic Body:** Noto Sans Arabic — clean, readable

Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64 / 96px

### Spacing
4px base unit. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Backgrounds
- Full-bleed dark void (`#0A0A0A`) with subtle texture or grain overlay (low opacity noise)
- No gradients except: very subtle radial vignette from black edges inward (opacity ~0.6)
- Section dividers: thin 1px gold line (`--gold-muted`), never heavy borders

### Animation
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (material standard) for transitions
- Duration: 250ms UI / 500ms reveals / 800ms page transitions
- Fades: opacity 0→1, sometimes with slight translateY(12px)→0
- No bounce, no spring — controlled, museum-quality

### Hover States
- Images: subtle scale(1.03) with brightness slightly increased
- Buttons: crimson darkens, gold brightens
- Links: color shifts from `--fg-secondary` to `--fg-primary`
- Cards: subtle border glow using `--gold-muted`

### Press/Active States
- Slight scale(0.97) + darken on buttons
- No dramatic shifts

### Borders & Radius
- **Corner radius:** 0px for structural elements (cards, sections) — sharp, gallery-like
- **2px** for badges/tags only
- **50%** for avatar/circle elements
- Border style: 1px solid `--border` for containers; 1px solid `--gold-muted` for highlighted

### Shadows
- No colored shadows
- Dark shadows only: `0 4px 24px rgba(0,0,0,0.6)`
- Elevation 1: `0 2px 8px rgba(0,0,0,0.4)`
- Elevation 2: `0 8px 32px rgba(0,0,0,0.6)`
- No inner shadows

### Cards
- Background: `--bg-surface`
- Border: 1px `--border`, hover → 1px `--gold-muted`
- Radius: 0
- Shadow: Elevation 1 by default; Elevation 2 on hover
- Image: always full-width at top, aspect-ratio 4:3 or square

### Imagery
- Color vibe: desaturated, dark-toned — photographs of 3D prints with dramatic studio lighting
- Occasional warm gold/amber fill lighting
- No bright lifestyle photos — museum/studio aesthetic
- Grain texture overlay on hero images

### Layout
- Max content width: 1200px, centered
- Generous negative space — content breathes
- RTL by default (Arabic-first), LTR mirror for English
- Fixed header with blur backdrop
- Grid: 12-column, 24px gutter

### Transparency & Blur
- Header: `backdrop-filter: blur(12px)` with `rgba(10,10,10,0.8)` bg
- Modals: blur(8px) on overlay
- No glass cards — blur reserved for nav only

---

## ICONOGRAPHY
- **No icon font** — icons are minimal inline SVGs or simple geometric shapes
- Style: thin stroke (1.5px), no fill — matches the 3D printer line-art in the logo
- Scale: 20×20px standard, 16×16px compact
- Color: `--fg-secondary` default, `--gold` on active/hover
- No emoji used anywhere
- No PNG icons — SVG only
- Logo asset: `assets/logo.jpeg`

---

## File Index

```
README.md                    ← This file
SKILL.md                     ← Agent skill definition
assets/
  logo.jpeg                  ← Brand logo (JPEG)
colors_and_type.css          ← All CSS custom properties
preview/
  colors-brand.html          ← Brand color swatches
  colors-semantic.html       ← Semantic color tokens
  type-display.html          ← Display / heading type specimens
  type-body.html             ← Body + UI type specimens
  type-arabic.html           ← Arabic type specimens
  spacing.html               ← Spacing & radius tokens
  shadows.html               ← Elevation / shadow system
  buttons.html               ← Button components
  cards.html                 ← Card components
  badges.html                ← Badges & tags
  inputs.html                ← Form inputs
  nav.html                   ← Navigation bar
ui_kits/
  gallery-site/
    README.md
    index.html               ← Interactive portfolio site prototype
    Header.jsx
    GalleryGrid.jsx
    ArtworkDetail.jsx
    Footer.jsx
```
