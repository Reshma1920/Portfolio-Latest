# Reshma — Portfolio Design System
> Tag this file in Cursor using `@DESIGN-SYSTEM.md` to apply these standards to any prompt.

---

## 🎨 Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#F7F6F2` | Page background (warm off-white) |
| `--color-dark-bg` | `#0a0a0f` | Dark sections, bento background |
| `--color-surface` | `rgba(255,255,255,0.06)` | Glassmorphic cards |
| `--color-border` | `rgba(255,255,255,0.12)` | Card borders |
| `--color-primary` | `#ffffff` | Headlines on dark, primary text |
| `--color-secondary` | `#a0a0b0` | Body text, nav links |
| `--color-muted` | `#6F6F6F` | Italic hero words, nav links |
| `--color-accent-1` | `#6B35B8` | Purple — primary accent |
| `--color-accent-2` | `#0F3D3E` | Dark teal — secondary accent |
| `--color-cta-bg` | `#12122a` | CTA button background |
| `--color-cta-arrow` | `linear-gradient(135deg, #6B35B8, #0F3D3E)` | Arrow box gradient |

---

## ✍️ Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | `'Instrument Serif'` | Headlines, logo |
| `--font-body` | `'Inter'` | Nav, body, descriptions |
| `--text-xs` | `12px` | Labels, captions |
| `--text-sm` | `14px` | Nav items |
| `--text-base` | `16px` | Body text |
| `--text-lg` | `18px` | Subtitles, descriptions |
| `--text-xl` | `20px` | Card titles |
| `--text-2xl` | `24px` | Section headers |
| `--text-hero` | `clamp(48px, 8vw, 96px)` | Hero headline |

### Type Styles
- **Hero headline**: Instrument Serif, font-normal, line-height 0.95, letter-spacing -2.46px, color #000
- **Italic accent words** (people, AI-first): color `#6F6F6F`, font-style italic
- **Nav items**: Inter, 14px, color `#6F6F6F`
- **Nav active**: transparent bg, `1.5px solid #111`, border-radius 12px
- **Body/subline**: Inter, 18px, color `#6F6F6F`, leading-relaxed

---

## 📐 Spacing

| Token | Value |
|-------|-------|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `40px` |
| `--space-2xl` | `64px` |

---

## 🔘 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `8px` | Small elements, tags |
| `--radius-md` | `12px` | Buttons, nav active state |
| `--radius-navbar` | `16px` | Navbar |
| `--radius-lg` | `24px` | Bento cards, outer container |
| `--radius-full` | `999px` | Pills |

---

## 🧱 Components

### Navbar
- Floating bar, background: `#F7F6F2`, border-radius: 16px, subtle shadow
- Logo: "Reshma", Instrument Serif, 22px, `#000`
- Nav links: Inter, 14px, `#6F6F6F`
- Active state: transparent bg, `1.5px solid #111`, border-radius 12px, padding 6px 16px
- No CTA button in navbar

### CTA Button — Primary with arrow
- Background: `#12122a`, border: `1px solid rgba(100,100,180,0.5)`
- Text: white, Inter, 15px, padding 14px 20px
- Arrow box: `linear-gradient(135deg, #6B35B8, #0F3D3E)`, border-radius 10px, margin 4px
- Overall border-radius: `14px`
- Hover: scale 1.03, box-shadow `0 0 24px rgba(107,53,184,0.4)`

### CTA Button — Primary text only
- Same as above but no arrow box
- Padding: 14px 28px
- Hover: scale 1.03, background lightens to `#1a1a3a`

### Button — Accent 1 (purple)
- Background: `#6B35B8`, border-radius 10px, padding 12px 24px
- Hover: background `#7d42d4`, scale 1.03

### Button — Accent 2 (teal)
- Background: `#0F3D3E`, border-radius 10px, padding 12px 24px
- Hover: background `#185455`, scale 1.03

### Button — Nav active
- Border: `1.5px solid #111`, border-radius 12px, transparent bg
- Hover: background `#111`, color white

### Button — Ghost
- Border: `1px solid rgba(255,255,255,0.2)`, border-radius 999px
- Color: `#a0a0b0`
- Hover: border brightens, color white, bg `rgba(255,255,255,0.05)`

### Glassmorphic Cards (Bento)
- Background: `rgba(255,255,255,0.06)`
- Backdrop blur: `blur(12px)`
- Border: `1px solid rgba(255,255,255,0.12)`
- Shadow: `0 8px 32px rgba(0,0,0,0.3)`
- Border radius: `24px`

### Bento Grid Layout
- One outer container wrapping all 3 cards, glassmorphic border, border-radius 24px
- Bento 1 (left): tall card ~50% width — chat UI
- Bento 2 (top right): half height of Bento 1 — Career Highlights
- Bento 3 (bottom right): half height of Bento 1 — Skills
- Gap between cards: 16px

---

## ✨ Animations

| Name | Spec |
|------|------|
| `animate-fade-rise` | opacity 0→1, translateY 20px→0, 0.8s ease-out |
| `animate-fade-rise-delay` | same + 0.2s delay |
| `animate-fade-rise-delay-2` | same + 0.4s delay |
| Ken Burns (bg) | scale 100%→108%, slight upward drift, infinite loop |

---

## 🖼️ Background
- Full screen image behind all content, position fixed, top 0, covers 100vh
- Dark overlay: `rgba(0,0,0,0.25)` on top
- Glassmorphic cards must allow background to show through — keep surface opacity low

---

## ♿ Accessibility
- All text must meet WCAG AA contrast
- All icons must be white or light on dark surfaces
- Body text minimum: white or `#e0e0e0` on glassmorphic cards

---

## 📱 Mobile — 768px breakpoint (`max-md` / `md:`)

Below **768px** viewport width:

### Navbar
- Hide inline nav links; show a **hamburger** (24×24px, three horizontal lines, `#000`) on the **right** of the bar.
- Tapping hamburger opens a **dropdown** that slides down from the bar: full width of the nav container, background **`#F7F6F2`**, items stacked vertically, **`16px` padding** per row, **`1px` border-bottom** between items (`Home`, `Work`, `Resume`, `LinkedIn`, `AI Playground`).
- Choosing an item **closes** the menu and navigates (in-page hash or external). Tapping hamburger again **toggles** closed. Prefer closing on outside tap and **Escape**.
- **Resume** in the mobile menu uses **`/resume.pdf`** — add the file as `public/resume.pdf` or update the href in code.

### Intro chat (Bento)
- Below **768px**, keep the chat **in document flow** under the hero (not `position: fixed`) so it does not float over other content. Width: **full width of the padded column**, **`max-width: 380px`**, centered, with horizontal padding from the section (`16px`) so nothing touches the viewport edge or overflows.

### Horizontal page padding
- Below 768px use **`16px`** left/right horizontal padding on page sections where applied (nav rail, intro chat shell, work band wrapper on home). Desktop (`md+`) spacing stays unchanged.

---

## 📝 How to use in Cursor
Start every prompt with:
`@DESIGN-SYSTEM.md — follow all tokens, components, and rules defined here.`
