---
name: EML Designer
description: >
  Generate EML (React JSX) code for Wix website sections using Tailwind v4.1
  layout classes and Wix component schemas. Use when building, implementing,
  or generating section EML, JSX components, or Wix site markup.
---

## EML Generation Instructions

You are generating EML (React JSX) for individual website sections following
the approved `plan.md` global brief and per-section local briefs.

### Workflow Per Section

1. Read `plan.md` to get global brief + the next unchecked `- [ ]` section brief
2. Call `query_component_schema` with the component names needed for this section
3. Write EML to `sections/{section-id}.eml` via `write_file`
4. Call `validate_eml` on the file — fix issues and re-validate until pass
5. Mark section done in plan.md: change `- [ ]` to `- [x]` via `edit_file`

---

## Color Application Logic

### MANDATORY: Background-Based Color Rules

**On Base 1, Shade 1, or Primary Box backgrounds:**
- Primary text: Base 2
- Secondary text: Shade 3
- Buttons: Standard (uses Accent 1)

**On Base 2, Shade 3, Accent 1, or Secondary Box backgrounds:**
- Text: Base 1 ONLY
- Buttons: Inverted custom (bg Base 1, text Base 2)

**On Accent 2, 3, or 4 backgrounds:**
- Text: Base 2
- Buttons: Custom (bg Base 2, text Base 1)

### Button Implementation
- **Standard button**: `brand="button-primary"` — uses Accent 1 automatically
- **Custom button**: `cssProperties={{ background: "var(--wst-base-2-color)" }}` + `elements={{ label: { cssProperties: { color: "var(--wst-base-1-color)" } } }}`
- **Inverted custom button**: `cssProperties={{ background: "var(--wst-base-1-color)" }}` + `elements={{ label: { cssProperties: { color: "var(--wst-base-2-color)" } } }}`
- If using `brand`, do NOT include `cssProperties` or `cssCustomProperties`

---

## Theme Variable Format

### Color Variable Names

The CSS variable pattern for colors is `var(--wst-{role}-color)`:

```
var(--wst-base-1-color)     var(--wst-base-2-color)
var(--wst-shade-1-color)    var(--wst-shade-2-color)    var(--wst-shade-3-color)
var(--wst-accent-1-color)   var(--wst-accent-2-color)   var(--wst-accent-3-color)   var(--wst-accent-4-color)
```

WRONG: `var(--wst-color-base-1)` — this format does NOT exist.

### Text Color Variables (Per-Role)

ALWAYS use the per-role text color variable — NOT a generic color variable:

```
var(--wst-heading-1-color) through var(--wst-heading-6-color)
var(--wst-paragraph-1-color) through var(--wst-paragraph-3-color)
```

Even if the local brief says "H1 uses Base 2", use `var(--wst-heading-1-color)` because that variable IS wired to Base 2. This ensures the theme system stays connected.

### Font Variables

```
var(--wst-heading-1-font) through var(--wst-heading-6-font)
var(--wst-paragraph-1-font) through var(--wst-paragraph-3-font)
```

### Typography Rule

For Text components you MUST always set BOTH `font` and `color` cssProperties, plus the default properties:

```jsx
cssProperties={{
  font: "var(--wst-heading-1-font)",
  color: "var(--wst-heading-1-color)",
  letterSpacing: "0em",
  writingMode: "horizontal-tb",
  mixBlendMode: "normal",
}}
```

ONLY use a generic color variable (like `var(--wst-shade-3-color)`) when specific color treatment is required that differs from the role's default.

---

## Data Props Format

### Text Component — richText

The `richText` field is an OBJECT with `text` and `linkList` fields:

```jsx
data={{
  richText: {
    text: "<h1>Your Headline Here</h1>",
    linkList: [],
  },
}}
```

WRONG: `data={{ richText: "<h1>Title</h1>" }}` — this is not the correct format.

The `text` field supports: `<ul>`, `<ol>`, `<h1>`-`<h6>`, `<p>`, `<blockquote>`.
The `text` field CANNOT contain theme variables — only in cssProperties.

### Button Component — data

```jsx
data={{ label: "Click Me" }}
```

NO `link` property in button data. Only `label`, `direction`, `iconCollapsed`.

---

## Preset Props

Components MUST include the correct `preset` prop:

| Component | Preset |
|-----------|--------|
| `<Text>` | `preset="horizontal"` |
| `<Button>` | `preset="baseButton"` |
| `<Line>` | `preset="horizontal"` |
| `<Menu>` | `preset="horizontalScrollNavbar"` |

---

## Animation Format

Animations use `name` (not `type`), duration in **milliseconds** (not seconds), and a nested `params` object:

```jsx
entranceAnimation={{
  name: "FadeIn",
  params: {
    duration: 1200,
    delay: 0,
    allowReplay: "perPageView",
  },
}}
```

For directional animations, add `direction`:

```jsx
entranceAnimation={{
  name: "FloatIn",
  params: {
    duration: 1000,
    delay: 100,
    allowReplay: "perPageView",
    direction: "bottom",
  },
}}
```

Available animation names: `FadeIn`, `FloatIn`, `SlideIn`, `RevealIn`, `ArcIn`, `TiltIn`, `WinkIn`

### Critical Animation Rules

**Float in:**
- Always from bottom, never sides
- If heading floats → paragraph MUST also float
- BANNED inside containers/nested elements (cards, boxes, columns, grids)
- Allowed only in full-width sections and hero areas

**Slide in:**
- Text: always from bottom
- Images: from alignment side (left-aligned → from left)
- Centered elements: from bottom

**Reveal in:**
- Images ONLY (never text), from alignment side

**Advanced animations:**
- BANNED for small elements: no H4/H5/H6, small images (<40vh), small containers (<40vh)
- Large images only (>40vh), max 2 per page
- Shape Scroll: square shape only, max 2 per page

**Nested elements (inside cards):**
- Static or Fade in ONLY — no Float/Slide/directional animations

**H1 MUST be static** — never animate the hero headline.
Max 2 animation types per section. Total delay max 800ms.
NEVER use mouse animations or bounce.
Balance: not everything needs animation (40-70%). Animate focal points, leave supporting content static.

---

## Background Element Structure

Section, Header, and Footer components use a Background element. ALWAYS include the full structure:

```jsx
elements={{
  Background: {
    cssCustomProperties: {
      backgroundColor: "var(--wst-base-1-color)",
    },
    data: {
      loop: true,
      fittingType: "fill",
      showControls: true,
      autoplay: true,
      qualityPolicy: "proportional",
      muted: true,
      playbackRate: "1.0",
    },
  },
}}
```

Container Background elements also follow this pattern (with `cssCustomProperties` for backgroundColor and the same `data` structure).

---

## Layout Rules

### Containers
- Each section has one Section component as root
- Section must be EITHER CSS grid or flex — NEVER both
- Layout containers: keep unstyled (no CSS props or brand)
- Styled containers (branded boxes): ALWAYS apply at least p-5 padding
- Never use primary/secondary boxes for layout — they are decorative only
- All containers use overflow: clip — cannot be changed
- Container MUST always include either `flex` or `grid` class

### Responsive Design
- Layout MUST be responsive using grid or flex
- Design for desktop only — no lg, md, sm breakpoints
- Absolute positioning is STRICTLY FORBIDDEN
- Tailwind spacing scale: 1 unit = 4px

### Image Component
- Implemented as `<div>` with background image — default width/height are auto
- If parent can't stretch, set explicit width or height
- For aspect ratio, use `aspect-<fraction>` TAILWIND CLASS — NOT in cssCustomProperties
- For image generation: add `imageGeneration={{ hint: 'description' }}` prop
- NEVER place images on top of other images or image backgrounds
- For text overlapping images: image component MUST be defined before text in JSX
- Image cssCustomProperties use KEBAB-CASE keys: `"border-radius"`, `"border-width"`, etc.

### Gallery
- Use 'WixGallery' widget for multiple images
- Match number of items to number of columns

---

## Section-Specific Rules

### Header
- Mandatory: Logo (100px width = w-25), Menu
- Optional: Max 1 CTA button
- Prohibited: No other components, no text boxes for site name, no lines
- Structure: Single column, no container boxes
- Logo: don't populate data — added by system
- Logo spacing: 30px padding to immediate right
- Menu: use `elements` prop for navbar nesting, never populate item values
- Menu item spacing: strictly between 5px and 25px
- Menu preset: `preset="horizontalScrollNavbar"`
- Background: may use Base 1, Base 2, or Shade 1-3

### Hero
- Use H1 for title
- Text alignment: centered or left only (NEVER right)
- Recommended height: 600px
- If background image → text in container with colored bg, opacity > 0.7
- Ensure headline container is wide enough for each word intact

### List / Services
- 3-6 items, 2-4 cards per row
- Use H5 for item titles
- Equal-size containers, buttons docked bottom
- For product showcase: use SliderProductGallery component, not custom cards
- Card height max 40% of section height

### Contact Section
- `ContactForm` does NOT exist in Wix — build contact sections with Text + Button components
- Can include Google Maps widget, contact details text, social media links

### Footer
- Logo width: 100px (w-25) if used
- Background: MUST match header luminance group
- Year: 2026
- No navigation links

---

## JSX Output Rules

### Component Tags — CORRECT Names
The Wix parser resolves components by exact Nickname. Use ONLY these tags:

| Tag | Notes |
|---|---|
| `<Section>` | Root container for page sections |
| `<Header>` | Site header wrapper |
| `<Footer>` | Site footer wrapper |
| `<Container>` | Layout/styled container |
| `<Text>` | Rich text — NOT `<RichText>`! |
| `<Image>` | Self-closing (`/>`) |
| `<Button>` | CTA and action buttons |
| `<Line>` | Self-closing (`/>`) |
| `<Logo>` | Self-closing (`/>`) — system-populated |
| `<Menu>` | Navigation menu |
| `<SocialBar>` | Social media links |
| `<TextMarquee>` | Running/scrolling text |
| `<WixGallery>` | Multi-image gallery |

### Structure
- Output ONLY valid React JSX — no imports, no comments, no explanations
- Every component MUST have a unique ID
- Never change IDs of existing components
- Don't place containers as global section component

### ID Conventions
- Section IDs: use the `section-id` from plan.md (e.g., `hero-1`, `about-1`, `header`)
- Container IDs: `{section}-{purpose}-container` (e.g., `hero-content-container`)
- Content IDs: `{section}-{element-type}` (e.g., `hero-headline`, `hero-cta-button`)
- All IDs must be kebab-case, unique across the entire site

### CSS Properties
- Do NOT mix between components' css props — apply ONLY allowed props per component
- CSS custom property keys must match exact casing from schema (kebab-case for Image, camelCase for Container)
- Use full CSS shorthand syntax
- Font shorthand order: `font: [style] [variant] [weight] [stretch] [size]/[line-height] [family]`

### Validation Before Output
- Every opening bracket has corresponding closing bracket
- Every component has an ID
- All syntax is valid JSX
- All classes are from the component's allowed class list
- Format with Prettier style: multi-line props, trailing commas

---

## Accessibility

- All text visible and readable — no cutoffs, no overlapping
- No broken text rows or orphaned words
- Consistent alignment (margins, padding, spacing)
- Text hierarchy applied consistently
- All content visible over backgrounds
- Buttons have appropriate standard size
- WCAG AA contrast for all text/background combinations

---

## Content Guidelines

### Text
- Generate content relevant to business type and section purpose
- Follow section description to avoid repetition with other sections
- H1 title: typically 2-8 words
- Body text (P2): max 70% screen width centered, 50% left-aligned
- Max 12 words per row, max 100 words per paragraph block
- H2 for section headings (H1 only for Hero)
- H5 for List section item titles

### Images
- Use `imageGeneration={{ hint: 'description' }}` for new images
- Hint should describe content and composition (gender, nationality, age if relevant)
- Background image hints: abstract/plain, no interference with text
- Never place imageGeneration inside data prop — it's a standalone prop

---

## Example: Hero Section EML

This shows correct structure, theme variables, animation rules, and component patterns.

```jsx
<Section
  id="hero-1"
  classes="grid grid-cols-[55%_45%] items-center px-10 py-20"
  elements={{
    Background: {
      cssCustomProperties: {
        backgroundColor: "var(--wst-base-1-color)",
      },
      data: {
        loop: true,
        fittingType: "fill",
        showControls: true,
        autoplay: true,
        qualityPolicy: "proportional",
        muted: true,
        playbackRate: "1.0",
      },
    },
  }}
>
  <Container id="hero-content-container" classes="flex flex-col items-start gap-8">
    <Text
      id="hero-headline"
      data={{
        richText: {
          text: "<h1>Flowers for Every Season</h1>",
          linkList: [],
        },
      }}
      cssProperties={{
        font: "var(--wst-heading-1-font)",
        color: "var(--wst-heading-1-color)",
        letterSpacing: "0em",
        writingMode: "horizontal-tb",
        mixBlendMode: "normal",
      }}
      preset="horizontal"
    />
    <Text
      id="hero-subtext"
      data={{
        richText: {
          text: "<p>Handcrafted bouquets that bring nature's beauty into your everyday moments.</p>",
          linkList: [],
        },
      }}
      cssProperties={{
        font: "var(--wst-paragraph-1-font)",
        color: "var(--wst-paragraph-1-color)",
        letterSpacing: "0em",
        writingMode: "horizontal-tb",
        mixBlendMode: "normal",
      }}
      preset="horizontal"
      entranceAnimation={{
        name: "FloatIn",
        params: {
          duration: 800,
          delay: 0,
          allowReplay: "perPageView",
          direction: "bottom",
        },
      }}
    />
    <Button
      id="hero-cta"
      brand="button-primary"
      data={{ label: "Shop Bouquets" }}
      preset="baseButton"
    />
  </Container>
  <Image
    id="hero-image"
    imageGeneration={{
      hint: "A lush seasonal flower bouquet in a ceramic vase, soft natural light, editorial photography style.",
    }}
    classes="w-full aspect-3/4"
    entranceAnimation={{
      name: "FadeIn",
      params: {
        duration: 1000,
        delay: 300,
        allowReplay: "perPageView",
      },
    }}
  />
</Section>
```

Key patterns demonstrated:
- Component tag is `<Text>` — NOT `<RichText>`
- Text data uses `richText` as object: `{ text: "...", linkList: [] }`
- H1 has NO animation (static) — this is mandatory
- P1 uses FloatIn at section level (not inside a nested container)
- Animation uses `name` + `params` wrapper with duration in milliseconds
- Image uses FadeIn (not FloatIn)
- Image aspect ratio is set via Tailwind class `aspect-3/4`, NOT cssCustomProperties
- Both `font` and `color` set on every Text, plus `letterSpacing`, `writingMode`, `mixBlendMode`
- Color variables use `var(--wst-{role}-color)` format — NOT `var(--wst-color-{role})`
- Text colors use per-role variables: `var(--wst-heading-1-color)`, `var(--wst-paragraph-1-color)`
- Background includes full media `data` structure
- Text has `preset="horizontal"`, Button has `preset="baseButton"`
- imageGeneration is a standalone prop (not inside data)
- Button uses `brand` with no cssProperties, data has `label` only (no `link`)

---

## Quality Checklist

Before finalizing each section's EML:
- [ ] Component tags use correct Wix Nicknames (`<Text>` not `<RichText>`)
- [ ] Color variables use `var(--wst-{role}-color)` format (NOT `var(--wst-color-{role})`)
- [ ] Text colors use per-role variables (`var(--wst-heading-N-color)`, `var(--wst-paragraph-N-color)`)
- [ ] All Text components have: `font`, `color`, `letterSpacing`, `writingMode`, `mixBlendMode`
- [ ] richText data is object: `{ text: "...", linkList: [] }` (NOT a raw string)
- [ ] Animations use `{ name, params: { duration (ms), delay (ms), allowReplay } }` format
- [ ] Text has `preset="horizontal"`, Button has `preset="baseButton"`, Line has `preset="horizontal"`
- [ ] Background elements include full `data` object (loop, fittingType, etc.)
- [ ] Color application follows background-based rules exactly
- [ ] Component IDs are unique and follow naming convention
- [ ] All JSX brackets balanced and valid
- [ ] Only allowed Tailwind classes used per component schema
- [ ] No absolute positioning
- [ ] Accessibility standards met
- [ ] Animation rules followed (no float in containers, H1 static)
- [ ] Button data has `label` only — no `link` property
- [ ] Image cssCustomProperties use kebab-case keys
- [ ] Image aspect ratio in classes, not cssCustomProperties
- [ ] Logo width is exactly w-25 (100px)
- [ ] `validate_eml` passes
