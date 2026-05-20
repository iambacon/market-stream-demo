---
name: Market Stream Demo
description: A high-frequency trading dashboard that prioritises clarity and calm.
colours:
  primary: "#191c1d"
  primary-foreground: "#fcfcfc"
  neutral-bg: "#ffffff"
  neutral-fg: "#252525"
  destructive: "#bd1b1b"
  border: "#ebebeb"
  muted: "#f7f7f7"
typography:
  display:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "var(--font-geist-mono), monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColour: "{colours.primary}"
    textColour: "{colours.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card:
    backgroundColour: "{colours.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Market Stream Demo

## 1. Overview

**Creative North Star: "The Calm Stream"**

The Market Stream design system is built to handle the high-velocity nature of trading data without overwhelming the user. It prioritises clarity over complexity, ensuring that even under extreme market volatility, the interface remains presentable and approachable. The aesthetic philosophy is one of **Refined Restraint**: every pixel must justify its presence, and decorative elements are stripped away to let the data lead.

This system explicitly rejects the "AI Slop" aesthetic of unnecessary blurs, neon accents, and generic tech-demo boilerplates. Instead, it leans into precise typography and a strictly limited palette.

**Key Characteristics:**
- **Clarity over Chaos**: Data is the hero, not the container.
- **Refined Precision**: Sharp borders and consistent spacing over soft shadows.
- **Approachable Expertise**: A professional-grade tool that feels inviting, not intimidating.

## 2. Colours

The palette is anchored in neutral, high-contrast tones to ensure that volatility markers (reds/greens) are instantly legible.

### Primary
- **Signal Black** (#191c1d / oklch(0.205 0 0)): Used for primary actions and grounding elements. Its depth provides a stable anchor for the "Calm Stream."

### Neutral
- **Paper White** (#ffffff / oklch(1 0 0)): The canvas for the dashboard.
- **Inertia Grey** (#252525 / oklch(0.145 0 0)): Primary text colour, providing high contrast without the harshness of pure black.
- **Muted Frost** (#f7f7f7 / oklch(0.97 0 0)): Used for secondary backgrounds and inactive states.
- **Precision Border** (#ebebeb / oklch(0.922 0 0)): Subtle separation for cards and sections.

### Status
- **Success Emerald** (#10b981 / oklch(0.692 0.16 160)): Used for positive market movements and growth indicators.
- **Alert Crimson** (#bd1b1b / oklch(0.577 0.245 27.325)): Reserved for high-volatility drops and destructive actions.

**The One Voice Rule.** The primary accent is used on ≤10% of any given screen. Its rarity is the point, ensuring that when the user's attention is called, it is for a meaningful reason.

## 3. Typography

**Display Font:** Sans-serif (Geist Sans or system fallback)
**Body Font:** Sans-serif (Geist Sans or system fallback)
**Label/Mono Font:** Monospace (Geist Mono)

**Character:** Technical and transparent. The typography is designed to disappear, serving as a clean conduit for market values.

### Hierarchy
- **Display** (600, 2.25rem, 1.2): Used for primary market indicators and large labels.
- **Body** (400, 0.875rem, 1.5): Standard for descriptions and secondary data.
- **Label** (500, 0.75rem, 1): Used for table headers and small captions.
- **Mono** (400, 0.875rem): Critical for price values and timestamps to ensure character alignment.

## 4. Elevation

The system is **Flat and Integrated**. Depth is conveyed through tonal layering (light greys against white) and precise borders rather than shadows.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows are prohibited. Separation is achieved through 1px borders (#ebebeb) or subtle background shifts (#f7f7f7).

## 5. Components

Components are **Refined and Restrained**, avoiding large radii or heavy animations.

### Buttons
- **Shape:** Rounded-lg (8px radius)
- **Primary:** Signal Black background with Paper White text.
- **Refined Treatment:** A subtle 1px border is used on outline variants to maintain the "Calm Stream" precision.
- **Hover:** A gentle lightness shift; never a colour change.

### Cards / Containers
- **Corner Style:** Rounded-lg (10px)
- **Background:** Paper White
- **Shadow Strategy:** None. 1px Precision Border only.
- **Internal Padding:** 24px (lg)

### Inputs
- **Style:** Minimalist stroke (#ebebeb), 8px radius.
- **Focus:** 3px ring in Signal Black at 50% opacity.

## 6. Do's and Don'ts

### Do:
- **Do** use Monospace for all financial values and price streams.
- **Do** maintain a strict 1px border for all container separation.
- **Do** use OKLCH for any new colour definitions to maintain perceptual uniformity.

### Don't:
- **Don't** use box-shadows or "glassmorphism" effects.
- **Don't** use gradients in typography or backgrounds.
- **Don't** use border-left greater than 1px as a coloured stripe on cards.
- **Don't** look like AI Slop: avoid generic, over-stylised, or incoherent AI-generated aesthetics.
