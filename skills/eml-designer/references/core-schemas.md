# Core Component Schemas

These are the structural components always available. For other component schemas
(Text, Image, Button, Logo, Menu, WixGallery, Line, SocialBar, etc.),
use the `query_component_schema` tool to retrieve them on demand.

## Section Props

```typescript
interface SectionProps {
  data?: SectionDataProps;
  cssProperties?: SectionCssProperties;
  cssCustomProperties?: SectionCssCustomProperties;
  elements?: {
    Background?: {
      cssCustomProperties?: {
        backgroundMediaOpacity?: string;
        backgroundColor?: string;
      };
      data?: SectionBackgroundDataProps;
    };
  };
  classes?: string; // Must be EITHER grid OR flex, never both
}
```

Section supported Tailwind classes: padding (`p-`, `pt-`, `pb-`, `pl-`, `pr-`),
grid system (`grid`, `grid-cols-`, `grid-rows-`, `gap-`), flexbox (`flex`, `flex-row`,
`flex-col`, `items-`, `justify-`, `content-`), flex sizing (`basis-`, `grow`, `shrink`).

## Container Props

```typescript
interface ContainerProps {
  brand?: 'box-primary' | 'box-secondary';
  data?: ContainerDataProps;
  classes?: string; // Must include flex or grid
  entranceAnimation?: EntranceAnimationType;
  scrollAnimation?: ScrollAnimationType;
  cssCustomProperties?: {
    borderBottomStyle?: string;
    borderBottomWidth?: string;
    borderBottomColor?: string;
    borderStartEndRadius?: string;
    boxShadow?: string;
    borderInlineEndWidth?: string;
    borderTopWidth?: string;
    borderInlineStartColor?: string;
    borderStartStartRadius?: string;
    borderInlineStartWidth?: string;
    borderTopStyle?: string;
    borderEndStartRadius?: string;
    borderInlineStartStyle?: string;
    borderInlineEndStyle?: string;
    borderInlineEndColor?: string;
    borderTopColor?: string;
    borderEndEndRadius?: string;
  };
  elements?: {
    Background?: {
      cssCustomProperties?: {
        backgroundColor?: string;
        backgroundMediaOpacity?: string;
      };
      data?: ContainerBackgroundDataProps;
      imageGeneration?: { hint: string };
    };
  };
}
```

Container supported classes: margins (`m-`, `mt-`, `mb-`, `ml-`, `mr-`, `-m-`),
padding (`p-`, `pt-`, `pb-`, `pl-`, `pr-`), sizing (`w-3xs` through `w-7xl`,
`max-w-`, `min-w-`), grid system, flexbox, gap, self/justify alignment.

If using `brand` prop, do NOT include `cssProperties` prop.

## Header Props

```typescript
interface HeaderProps {
  data?: HeaderDataProps;
  classes?: string;
  elements?: {
    Background?: {
      cssCustomProperties?: {
        backgroundMediaOpacity?: string;
        backgroundColor?: string;
      };
    };
  };
}
```

Same Tailwind classes as Section (padding, grid, flex, sizing).

## Footer Props

```typescript
interface FooterProps {
  data?: FooterDataProps;
  classes?: string;
  elements?: {
    Background?: {
      cssCustomProperties?: {
        backgroundMediaOpacity?: string;
        backgroundColor?: string;
      };
    };
  };
}
```

Same Tailwind classes as Section.

## Background Props (inner element for Section/Container/Header/Footer)

```typescript
interface BackgroundCssCustomProperties {
  backgroundColor?: string;
  backgroundMediaOpacity?: string;
}

interface BackgroundDataProps {
  isDecorative: boolean;
  loop: boolean;
  fittingType: 'fill' | 'tile';
  autoplay: boolean;
  focalPoint?: { x: number; y: number };
  qualityPolicy: 'highest' | 'proportional' | 'adaptive';
  alt?: string;
  muted: boolean;
}
```

Background is NOT a standalone component. It is an inner element of sections and containers.

## Entrance Animation Types

```typescript
type EntranceAnimationType =
  | { type: 'FadeIn'; duration?: number; delay?: number }
  | { type: 'FloatIn'; duration?: number; delay?: number; direction: 'bottom' }
  | { type: 'SlideIn'; duration?: number; delay?: number; direction: 'bottom' | 'left' | 'right' }
  | { type: 'RevealIn'; duration?: number; delay?: number; direction: 'left' | 'right' | 'top' | 'bottom' }
  | { type: 'ArcIn'; duration?: number; delay?: number }
  | { type: 'TiltIn'; duration?: number; delay?: number }
  | { type: 'WinkIn'; duration?: number; delay?: number };
```

## Scroll Animation Types

```typescript
type ScrollAnimationType =
  | { type: 'ParallaxScroll'; speedFactor?: number }
  | { type: 'ShapeScroll'; shape: 'square' };
```

## Key Rules

1. Section component MUST be EITHER CSS grid or flex, NEVER combine
2. Container MUST always include either a flex or grid class
3. Absolute positioning is STRICTLY FORBIDDEN
4. Background is an inner element, not a standalone component
5. No `lg:`, `md:`, `sm:` breakpoint prefixes — desktop only
6. Tailwind spacing scale: 1 unit = 4px
7. All containers use overflow: clip
