---
name: Brand Designer
description: >
  Generate Wix brand theme variables (brandTheme.json) defining colors,
  typography, buttons, boxes, and lines. Use when building, creating, or
  updating the site brand, theme, or design variables.
---

## Brand Theme Generation Instructions

You are translating the design decisions in `plan.md` into a structured set of
`wst-*` variables that define the website's visual identity. The output is saved
as `brandTheme.json` via the `save_brand_theme` tool.

### Workflow

1. Read `plan.md` to extract: Color Palette, Typography, Buttons, Lines, Boxes
2. Map each design decision to the corresponding `wst-*` variables below
3. Call `save_brand_theme` with the complete variable map
4. If validation fails, fix issues and retry

---

## Variables

Each brand ingredient is composed of a set of variables that collectively define
the brand's design. Every style attribute of a branded component is linked to
these variables. When the Wix platform reads these values, it applies them to
all branded components site-wide.

---

## Colors

There are 9 colors in the website palette:

- **Base 1:** Primary background color for elements and apps
- **Base 2:** Primary text color on the site
- **Shade 1:** Secondary background color
- **Shade 2:** Intermediate tone between Shade 1 and 3, also used for disabled states
- **Shade 3:** Secondary text color and text in additional elements
- **Accent 1:** Color of links and actions
- **Accent 2-4:** For accents and additional uses

For accessibility, ensure Base 2 on Base 1 meets WCAG AA (4.5:1 ratio).
Shade 3 on Base 1 should meet AA for secondary text (4.5:1 ratio).

**Color Variables:**
```
"wst-base-1-color": "ColorVar"
"wst-base-2-color": "ColorVar"
"wst-shade-1-color": "ColorVar"
"wst-shade-2-color": "ColorVar"
"wst-shade-3-color": "ColorVar"
"wst-accent-1-color": "ColorVar"
"wst-accent-2-color": "ColorVar"
"wst-accent-3-color": "ColorVar"
"wst-accent-4-color": "ColorVar"
```

### Supported Color Formats

- **HEX (preferred):** Always use 6-digit HEX format (e.g., `#FF5733`). This is the default and preferred format.
- **RGB:** Use only if the user explicitly requests RGB format (e.g., `rgb(255, 87, 51)`).
- **Unsupported formats — NEVER use:**
  - HSL/HSLA (e.g., `hsl(14, 100%, 60%)`)
  - Named colors (e.g., `red`, `blue`)
  - 4-digit HEX (`#RGBA` shorthand like `#1234`) — includes alpha/opacity
  - 8-digit HEX (`#RRGGBBAA` like `#FF573380`) — includes alpha/opacity
  - RGBA (e.g., `rgba(255, 87, 51, 0.5)`)

For all color-related variables, after assigning the main 9 colors, use variable
references for component colors. For example:
`"wst-primary-background-color": "wst-base-1-color"`

---

## Typography

The Type Scale has 9 Roles: 6 Headings + 3 Paragraphs.

**Roles and suggested use:**
- **Heading 1:** Hero section / first fold
- **Heading 2:** Section headers
- **Heading 3:** Item titles (service list items, etc.)
- **Heading 4-6:** Subheadings
- **Paragraph 1:** Lead text (not a heading)
- **Paragraph 2:** Body text
- **Paragraph 3:** Captions

Each text style uses: Font Family, Font Size, Font Weight, Font Style, Line Height, Color.

**Font Variables:**
```
"wst-heading-1-font": "FontVar"
"wst-heading-2-font": "FontVar"
"wst-heading-3-font": "FontVar"
"wst-heading-4-font": "FontVar"
"wst-heading-5-font": "FontVar"
"wst-heading-6-font": "FontVar"
"wst-paragraph-1-font": "FontVar"
"wst-paragraph-2-font": "FontVar"
"wst-paragraph-3-font": "FontVar"
```

**Typography Role to Variable Mapping:**
- h1 / Heading 1 → wst-heading-1-font
- h2 / Heading 2 → wst-heading-2-font
- h3 / Heading 3 → wst-heading-3-font
- h4 / Heading 4 → wst-heading-4-font
- h5 / Heading 5 → wst-heading-5-font
- h6 / Heading 6 → wst-heading-6-font
- p1 / Paragraph 1 → wst-paragraph-1-font
- p2 / Paragraph 2 → wst-paragraph-2-font
- p3 / Paragraph 3 → wst-paragraph-3-font

**IMPORTANT — Font shorthand value strict order:**
`font: <font-style> <font-variant> <font-weight> <font-size>/<line-height> <font-family>;`

Example:
`"wst-heading-1-font": "normal normal 500 88spx/1em wix-madefor-display-v2"`

`<font-size>` and `<font-family>` are required; all others are optional but must follow order.

**IMPORTANT:** Convert all `px` font-size values to `spx`.

---

## Buttons

Three button types used throughout the website, globally configured:

1. **Primary Button:** Main action (high emphasis)
2. **Secondary Button:** Less prominent actions (medium emphasis)
3. **Tertiary Button:** Least prominent actions (low emphasis)

**CRITICAL — Button Font Variable Assignment:**
- **PREFER variable references** when an existing typography role matches:
  `"wst-button-primary-font": "wst-paragraph-2-font"`
- **Use raw CSS ONLY when necessary** — user requests unique button typography:
  `"wst-button-primary-font": "normal normal 600 14spx/1.4em custom-font"`

**Primary button variables:**
```
"wst-button-primary-background-color": "Background color"
"wst-button-primary-border-left-color": "Left border color"
"wst-button-primary-border-right-color": "Right border color"
"wst-button-primary-border-top-color": "Top border color"
"wst-button-primary-border-bottom-color": "Bottom border color"
"wst-button-primary-color": "Label color (Text)"
"wst-button-primary-font": "Typography variable reference OR raw CSS font shorthand"
"wst-button-primary-text-decoration": "Button text underline"
"wst-button-primary-text-transform": "Button text capitalization"
"wst-button-primary-letter-spacing": "Button text letter spacing"
"wst-button-primary-text-highlight": "Button text background color"
"wst-button-primary-text-shadow": "Button text shadow"
"wst-button-primary-box-shadow": "Button shadow"
"wst-button-primary-border-left-width": "Button left border width"
"wst-button-primary-border-right-width": "Button right border width"
"wst-button-primary-border-top-width": "Button top border width"
"wst-button-primary-border-bottom-width": "Button bottom border width"
"wst-button-primary-border-left-style": "Button left border style"
"wst-button-primary-border-right-style": "Button right border style"
"wst-button-primary-border-top-style": "Button top border style"
"wst-button-primary-border-bottom-style": "Button bottom border style"
"wst-button-primary-padding-bottom": "Button padding from the bottom"
"wst-button-primary-padding-top": "Button padding from the top"
"wst-button-primary-padding-left": "Button padding from the left"
"wst-button-primary-padding-right": "Button padding from the right"
"wst-button-primary-border-top-left-radius": "Button top left corner radius"
"wst-button-primary-border-top-right-radius": "Button top right corner radius"
"wst-button-primary-border-bottom-left-radius": "Button bottom left corner radius"
"wst-button-primary-border-bottom-right-radius": "Button bottom right corner radius"
"wst-button-primary-column-gap": "Column gap between label and icon"
"wst-button-primary-row-gap": "Row gap between label and icon"
```

Secondary and tertiary buttons use the same variable list with `secondary` or `tertiary` in place of `primary`.

### Button Design Guidelines

- **Contained button:** High emphasis — solid color fill
- **Outlined button:** Medium emphasis — border around text label
- **Text button:** Low emphasis — can be underlined or change in states

Only modify buttons that are useful for the design. Ensure alignment with existing button styles.

---

## Boxes

Two box variations used across the website, globally configured:

- **Primary box**
- **Secondary box**

**Primary box variables:**
```
"wst-box-primary-background-color": "Background color"
"wst-box-primary-border-left-color": "Left border color"
"wst-box-primary-border-right-color": "Right border color"
"wst-box-primary-border-top-color": "Top border color"
"wst-box-primary-border-bottom-color": "Bottom border color"
"wst-box-primary-border-left-width": "Left border width"
"wst-box-primary-border-left-style": "Left border style"
"wst-box-primary-border-right-width": "Right border width"
"wst-box-primary-border-right-style": "Right border style"
"wst-box-primary-border-top-width": "Top border width"
"wst-box-primary-border-top-style": "Top border style"
"wst-box-primary-border-bottom-width": "Bottom border width"
"wst-box-primary-border-bottom-style": "Bottom border style"
"wst-box-primary-border-top-left-radius": "Top left corner radius"
"wst-box-primary-border-top-right-radius": "Top right corner radius"
"wst-box-primary-border-bottom-left-radius": "Bottom left corner radius"
"wst-box-primary-border-bottom-right-radius": "Bottom right corner radius"
"wst-box-primary-box-shadow": "Box shadow"
```

Secondary box uses the same variables with `secondary` in place of `primary`.

### Box Design Guidelines

- Use visual differentiation: with/without fill, with/without border, different palette colors
- Boxes should NOT look the same — support visual variance

---

## Lines

Two line variations, globally configured:

**Line variables:**
```
"wst-system-line-1-color": "Line color"
"wst-system-line-1-width": "Line width"
"wst-system-line-2-color": "Line color"
"wst-system-line-2-width": "Line width"
```

### Line Design Guidelines

- Only use `solid` style
- Lines must differ in either color or width

---

## Additional Color Variables

Supplementary color settings for components not in the main brand elements:

1. **Primary Background** — default section color
2. **Secondary Background** — alternative section color
3. **Links & Actions** — hyperlink color
4. **Graphics Color 1-2** — icons, SVGs

```
"wst-primary-background-color": "Primary Background color"
"wst-secondary-background-color": "Secondary Background color"
"wst-links-and-actions-color": "Links Actions color"
"wst-graphics-1-color": "Graphics color"
"wst-graphics-2-color": "Graphics color"
```

---

## Opacity

The Wix Editor does NOT support opacity/alpha values in color variables. NEVER use:
- RGBA format (`rgba(255, 87, 51, 0.5)`)
- 8-digit HEX HEXA (`#FF5733CC`)
- 4-digit HEX HEXA shorthand (`#F53C`)
- HSLA format (`hsla(14, 100%, 60%, 0.5)`)

You CAN use the `transparent` keyword for transparent backgrounds:
`"wst-button-primary-background-color": "transparent"`

---

## Variable Value Rules

### No `--` prefix
Do not add `--` prefix in variable output. Use `wst-base-1-color`, not `--wst-base-1-color`.

### General: PREFER variable references over raw values
This ensures design consistency and enables global updates.

### Color Variable References
When setting ANY color-related variable for components (buttons, boxes, lines,
text, backgrounds, graphics):

**Step 1:** Check if the desired color matches any existing Color Variable:
`wst-base-1-color`, `wst-base-2-color`, `wst-shade-1-color` through `wst-shade-3-color`,
`wst-accent-1-color` through `wst-accent-4-color`

**Step 2:** Apply:
- Match found → use variable reference: `"wst-button-primary-background-color": "wst-accent-1-color"`
- No match AND user requested new color → use raw hex: `"wst-button-primary-background-color": "#FF5733"`

### Font Variable References
When setting font-related variables for buttons:

**Step 1:** Check if typography matches any existing Role:
`wst-heading-1-font` through `wst-heading-6-font`, `wst-paragraph-1-font` through `wst-paragraph-3-font`

**Step 2:** Apply:
- Match found → use reference: `"wst-button-primary-font": "wst-paragraph-2-font"`
- No match → use raw CSS: `"wst-button-primary-font": "normal normal 700 14spx/1.4em Oswald"`

### No mixed CSS values and variable references
Do not mix raw CSS with variable references in a single value. Resolve the reference first.

- WRONG: `"borderTop": "1px solid wst-shade-1-color"`
- WRONG: `"borderTop": "1px solid var(--wst-shade-color-1)"`
- CORRECT: `"borderTop": "1px solid #000000"` (where `wst-shade-1-color` is `#000000`)
- CORRECT: `"wst-button-primary-box-shadow": "10px 10px 10px #000000"`

### Use `spx` instead of `px` for:
- Border radius: `wst-{component}-border-{side}-radius`
- Padding: `wst-{component}-padding-{side}`
- Font-size (in font shorthand)

---

## Output Format

Call the `save_brand_theme` tool with:

```json
{
  "brand_theme": {
    "wst-base-1-color": "#F5F0E8",
    "wst-base-2-color": "#2E2321",
    "wst-shade-1-color": "#EAE4D9",
    "wst-accent-1-color": "#A38B73",
    "wst-heading-1-font": "normal normal 400 96spx/1em minion-pro",
    "wst-button-primary-background-color": "wst-accent-1-color",
    "wst-button-primary-color": "wst-base-1-color",
    "wst-button-primary-font": "wst-paragraph-2-font",
    "wst-button-primary-padding-top": "8spx",
    "wst-button-primary-border-top-left-radius": "4spx",
    "wst-primary-background-color": "wst-base-1-color",
    "wst-links-and-actions-color": "wst-accent-1-color"
  },
  "unfulfilled_requests": []
}
```

Only include variables that need values. No need to send unmodified variables.

### Mapping plan.md to variables

| Plan Section | Brand Variables |
|---|---|
| Color Palette → Base 1 | `wst-base-1-color` |
| Color Palette → Base 2 | `wst-base-2-color` |
| Color Palette → Shade 1-3 | `wst-shade-1-color` through `wst-shade-3-color` |
| Color Palette → Accent 1-4 | `wst-accent-1-color` through `wst-accent-4-color` |
| Typography → Full scale | `wst-heading-1-font` through `wst-paragraph-3-font` |
| Buttons → Primary/Secondary/Tertiary | `wst-button-{type}-*` variables |
| Lines → Line 1/2 | `wst-system-line-{n}-color`, `wst-system-line-{n}-width` |
| Boxes → Primary/Secondary | `wst-box-{type}-*` variables |
| Additional | `wst-primary-background-color`, etc. |

### Quality Checklist

Before calling `save_brand_theme`:
- [ ] All 9 color variables defined with 6-digit HEX values
- [ ] All 9 font variables defined with correct shorthand (spx units)
- [ ] Component colors use variable references where possible
- [ ] Button fonts prefer typography role references
- [ ] No opacity/alpha in any color value
- [ ] No `--` prefix on variable names
- [ ] No `var()` wrapper on values — just the variable name
- [ ] Padding and radius values use `spx` units
- [ ] Font shorthand order: style variant weight size/line-height family
- [ ] `wst-primary-background-color` and `wst-secondary-background-color` set
- [ ] `wst-links-and-actions-color` and `wst-graphics-1/2-color` set
