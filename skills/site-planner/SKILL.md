---
name: Site Planner
description: >
  Plan and design website structure including sitemap, pages, sections,
  color palette, typography, buttons, lines, boxes, animations, and
  local design briefs. Use when the user wants to create a website plan,
  define site architecture, choose colors, or establish design guidelines.
---

## Site Planning Instructions

You are creating a comprehensive site plan (`plan.md`) that will guide EML generation.
The plan must include a complete global design brief and per-section local briefs.

### Workflow

1. Analyze the user request: business type, style preferences, any image reference
2. Call `query_type_presets` with style tags and business type to find matching typography
3. Design the complete site plan following the schema below
4. Write `plan.md` via `write_file`
5. Present to user for review; iterate via `edit_file`

---

## Sitemap Rules

### Page Constraints
- Max 2 custom pages (excluding Wix Core App pages), unless user explicitly requests more
- Every site MUST have exactly ONE page called "Home"
- Home page MUST have at least 4 sections, first one being Hero
- Inner pages MUST have at least 2 sections
- Header and Footer are system sections — never add extra Header/Footer sections

### Section Naming
- Every section MUST have a meaningful name reflecting its type (Hero, Testimonials, About, Services, etc.)
- Section names should NOT be the copy of titles within the section
- The name "Section" is strictly forbidden
- Section descriptions must support business KPIs (conversion, reliability, etc.)
- Descriptions must NOT reference visual design elements, components, or layout

### Hero Scoping
- Hero sections are strictly reserved for the Home page only

### Wix Core Apps

Pages with `applicationName` MUST ONLY be added if the user request contains explicit trigger keywords:

- **Store**: "sell products", "e-commerce", "online shop", "online store", "storefront", "sell online"
- **Blog**: "blog", "posts", "articles", "news feed", "updates", "write blog", "publish content"
- **Bookings**: "book appointments", "schedule services", "online scheduling", "book a class", "book now", "book a session"
- **Events**: "host events", "event calendar", "sell tickets", "event registration", "workshops"
- **Online Programs**: "online courses", "learning programs", "video lessons"
- **Pricing Plans**: "membership plans", "subscription services", "tiered pricing"
- **Menus**: "display menu", "restaurant menu", "food items list", "online menu"
- **Table Reservations**: "book a table", "reserve seating", "restaurant reservations"
- **Groups**: "community forum", "member groups", "discussion boards"
- **Portfolio**: "portfolio", "showcase work", "display work", "gallery of work"

If the user request does NOT contain these keywords, do NOT add that app.
App pages have empty sections arrays — content is rendered by the Wix App.

For Home page sections matching app widget functionality, the description MUST state
which Wix App widget to use (e.g., "This section should be created using the Product Gallery widget").

---

## Color System (8 Active Colors)

Define colors and their roles with required contrast ratios:

| Role | Purpose | Contrast Requirement |
|------|---------|---------------------|
| Base 1 | Primary background + Primary Box | Base 1 ↔ Base 2: ≥ 6:1 |
| Base 2 | Primary text + Secondary Box | (same) |
| Shade 1 | Secondary background | Auto: 10% Base 2 + 90% Base 1 |
| Shade 3 | Secondary text (on Base 1 backgrounds) | Auto: 75% Base 2 + 25% Base 1 |
| Accent 1 | Buttons, links, CTAs | Base 1 ↔ Accent 1: ≥ 4.5:1 |
| Accent 2 | Secondary background | Accent 2 ↔ Base 2: ≥ 4.5:1 |
| Accent 3 | Secondary background | Accent 3 ↔ Base 2: ≥ 4.5:1 |
| Accent 4 | Secondary background | Accent 4 ↔ Base 2: ≥ 4.5:1 |

Note: Shade 2 is system-generated — NOT available for design use.

### Critical Color Rules
- Colors must be visually distinct in hue, not just different lightness of same hue
- After defining color hex values, ALWAYS reference by role name (Base 1, Accent 1, etc.)
- Never output raw hex in local briefs — use role names
- Header and Footer backgrounds MUST be from the same luminance group

### Color Source Logic
- **No image / internal image**: Be inspired by image aesthetic but NEVER mimic the exact palette. Prioritize business type and user request.
- **User image**: PRIORITIZE exact colors from image. Adjust only for accessibility.

---

## Typography

Select type scale exclusively from `query_type_presets` results.

- Select a single typescale as-is — do not mix properties from different presets
- No modifications or alterations to the selected preset
- After defining roles, ALWAYS use role names (H1, H2, P1, P2) instead of raw font shorthands

### Typescale Usage
- H1: Hero section title only, used once per page
- H2: Section headings (consistent across all sections)
- H5: List item titles
- Minimum text size: 12px

---

## Buttons (3 Types)

Color wiring is PERMANENT and cannot be modified:

**Primary Button**: bg Accent 1, text Base 1
**Secondary Button**: bg Base 1 (or transparent), border Accent 1, text Accent 1
**Tertiary Button**: bg transparent, text Accent 1, underline mandatory, padding 0

For each button define: typography role (p1 or p2), border radius, padding.
NEVER specify individual font properties on buttons — only reference the typography role.

---

## Lines (2 Types)

Define Line 1 and Line 2 with:
- Color (by role name)
- Width (stroke in px)
- Style (solid or dashed)

---

## Boxes (2 Types — Styled Containers)

Background wiring is PERMANENT:
- **Primary Box**: bg Base 1
- **Secondary Box**: bg Shade 1

For each box define: border specs, corner radius, shadow (prefer 0 shadow).

---

## Animations

### Step 1: Choose Animation Palette
Select 2-3 animations that work harmoniously:
- 2 Core Animations as foundation: Fade in, Float in, Slide in
- Optional 1 Advanced: Reveal in (images only), Shape Scroll, Arc in, Tilt in, Wink in, Parallax Scroll

### Step 2: Element Mapping
- H1: MUST remain static (NO animations)
- H2-H6: Fade in, Float in, Slide in (advanced for H2/H3 only, max 2-3/page)
- Paragraphs: Static, Float in (from bottom), or Fade in only
- Images: Fade in, Float in, Reveal in; advanced for hero/featured only (max 2/page)
- Containers: Small (<50vh): Float in, Fade in, Slide in. Large: do NOT animate
- Buttons: Static, Fade in, Reveal in (horizontal), Slide in (horizontal)
- If Float in chosen for headings → paragraphs MUST also use Float in

### Step 3: Balance
Target 40-60% of elements animated. Keep static: all H1s, body text, small UI, decorative elements, large section containers.

### Step 4: State in Plan
Format: `Palette: [A1], [A2], [A3] | Element Mapping: H1: Static | H2-H6: [x] | ... | Balance: [%]`

---

## Spacing

- Section Padding: left/right and top/bottom in pixels (minimum 20px)
- Gaps between elements
- CRITICAL: Avoid specifying grid systems, row/column counts

---

## Photographic Treatment (when applicable)

Define only if images use graphic styling. Describe treatment, not content:
- Effects (invert, grayscale, color filters)
- Cropping (tight, full-bleed, circular masks)
- Integration (bleeding, layered, contained)
- Corner treatment (sharp, radius, rounded)

---

## Section Rhythm — Visual Storytelling

Plan transitions between sections considering:
- **Coloration pattern**: Background color shifts that create visual chapters
  (e.g., primary/primary/inverted/primary, or dark/light/accent/dark)
- **Layout rhythm**: Vary layouts to create flow (split→full→cards→split)
- **Animation continuity**: Consistent motion language across sections

---

## Local Brief Format

Each section in the Sitemap gets a local brief following this format:

```
- [ ] **{Section Type}** (section-id: {id}) — {one-line description}
  - Layout: {container}, {areas}, {content groups}
  - Background: {color role}
  - Spacing: {critical spacing values}
  - Key: {2-3 essential design principles}
```

Use concise notation. Combine related specs. Use percentages over pixels for layout proportions.

### What to Always Include in Local Briefs
- Container width/height behavior
- Layout structure (percentage ratios, positioning)
- Content hierarchy (what goes where)
- Typography roles if text present
- Critical spacing that affects layout
- Key alignment rules
- Button type if buttons present (standard, custom, inverted custom)

---

---

## Example: Condensed plan.md

Below is a PARTIAL example showing the required structure and depth. Your real plan should have more sections and fuller local briefs.

```markdown
# Site Plan — Bloom & Co Florist

## Site Identity
Boutique flower shop specializing in seasonal arrangements and wedding florals with a warm, artisanal atmosphere.

## Visual Profile
Natural, Elegant, Artisanal

## Design Style
Editorial Minimalism

## Layout DNA
Asymmetric Split, alternating image/text dominance

## Global Spacing
- Section padding: 40px left/right, 80px top/bottom
- Element gaps: 20-40px between content blocks
- Card gaps: 24px (6% of section width)

## Color Palette
| Role | Hex | Usage | Contrast |
|------|-----|-------|----------|
| Base 1 | #FBF8F4 | Primary background | Base 1 ↔ Base 2: 14.2:1 |
| Base 2 | #1C1917 | Primary text | (same) |
| Shade 1 | #F0EDE8 | Secondary background | Auto |
| Shade 3 | #57534E | Secondary text | Shade 3 ↔ Base 1: 6.8:1 |
| Accent 1 | #7C5E3C | Primary CTA | Accent 1 ↔ Base 1: 5.9:1 |
| Accent 2 | #D4C5B2 | Card backgrounds | Accent 2 ↔ Base 2: 8.1:1 |
| Accent 3 | #E8DFD3 | Soft accent | Accent 3 ↔ Base 2: 11.3:1 |
| Accent 4 | #F5F0EA | Light accent bg | Accent 4 ↔ Base 2: 13.5:1 |

## Typography (Preset ID: 7)
- H1: Libre Caslon Display, 400, 72px, 1.1, -0.01em
- H2: Libre Caslon Display, 400, 48px, 1.15, 0
- H3: Libre Caslon Display, 400, 36px, 1.2, 0
- H4: DM Sans, 500, 24px, 1.3, 0
- H5: DM Sans, 500, 20px, 1.4, 0
- H6: DM Sans, 500, 16px, 1.4, 0.02em
- P1: DM Sans, 400, 18px, 1.6, 0
- P2: DM Sans, 400, 16px, 1.6, 0
- P3: DM Sans, 400, 14px, 1.6, 0

## Buttons
- Primary: P2, bg Accent 1, text Base 1, radius 0px, padding 10px 28px
- Secondary: P2, bg transparent, border 1px solid Accent 1, text Accent 1, radius 0px, padding 10px 28px
- Tertiary: P2, bg transparent, text Accent 1, underline, padding 0

## Lines & Boxes
- Line 1: Accent 1, 1px, solid
- Line 2: Shade 3, 1px, solid
- Primary Box: bg Base 1, border 1px solid Accent 2, radius 0px
- Secondary Box: bg Shade 1, border none, radius 0px

## Animations
- Palette: Fade In, Float In (bottom)
- Element Mapping: H1: Static | H2-H6: Float In (600ms) | Paragraphs: Float In (800ms) | Images: Fade In (1000ms) | Buttons: Static
- Balance: 45%

## Photographic Treatment
- Corner: sharp (0px radius)
- Integration: contained in frame, never full-bleed
- Aspect ratio: 3:4 portrait for hero, 1:1 square for cards

## Section Rhythm
Base 1 → Base 1 → Shade 1 → Base 1 → Accent 4 → Base 1 → Base 1
Layout: split-right → centered → cards → split-left → full-width → form-split → minimal

## Sitemap
### Page: Home
- [ ] **Header** (section-id: header) — Brand navigation
  - Layout: Logo left (w-25), Menu right, Primary CTA far right
  - Background: Base 1
  - Key: 100px logo, clean horizontal nav, P2 menu labels
- [ ] **Hero** (section-id: hero-1) — First impression
  - Layout: Split 55/45. Left: H1 + P1 + Primary CTA. Right: Full-height portrait image.
  - Background: Base 1
  - Spacing: 80px top/bottom
  - Key: H1 "Flowers for Every Season", image of seasonal bouquet, editorial feel
- [ ] **About** (section-id: about-1) — Our story
  - Layout: Centered narrow block (60% width). H2 + P2 + square image below.
  - Background: Shade 1
  - Spacing: 100px top/bottom
  - Key: Warm storytelling tone, single centered image
```

---

## Quality Checklist

Before finalizing plan.md, verify:
- [ ] Complete 8-color palette with contrast ratios met
- [ ] Typography from query_type_presets — no custom fonts
- [ ] All 3 button types defined with permanent color wiring
- [ ] 2 line types and 2 box types defined
- [ ] Animation palette with element mapping and balance %
- [ ] Header/Footer backgrounds from same luminance group
- [ ] Home page has 4+ sections starting with Hero
- [ ] Max 2 custom pages
- [ ] All section names are meaningful
- [ ] No forbidden layouts (carousel, slideshow, sticky, accordion, horizontal scroll)
- [ ] Section rhythm creates visual storytelling
- [ ] Wix Core Apps only added with explicit keyword matches
