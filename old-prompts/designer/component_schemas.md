"
  /*
  ### TAILWIND CLASSES REFERENCE
  The following class groups are available for components.

  Each component lists which groups it supports.

  Each component will specify in a comment next to its `classes` property, which groups of tailwind classes it supports.

  The following list of groups is available:
  The spacing is 4px.
      
      - containers:
p-<number>
pt-<number>
pb-<number>
pl-<number>
pr-<number>
px-<number>
py-<number>
p-[<value>]: <value>; Allowed values = %, px. No other values allowed.
pt-[<value>]: <value>; Allowed values = %, px. No other values allowed.
pb-[<value>]: <value>; Allowed values = %, px. No other values allowed.
pl-[<value>]: <value>; Allowed values = %, px. No other values allowed.
pr-[<value>]: <value>; Allowed values = %, px. No other values allowed.
px-[<value>]: <value>; Allowed values = %, px. No other values allowed.
py-[<value>]: <value>; Allowed values = %, px. No other values allowed.
flex
grid
grid-cols-<number>
grid-cols-[<value>]: <value>; Allowed values = minmax(value,value), repeat(count,value), auto, max-content, min-content, <number>fr, <number>px, <number>vw, <number>vh, <number>%. No other values allowed. Nested minmax is not allowed
grid-rows-<number>
grid-rows-[<value>]: <value>; Allowed values = minmax(value,value), repeat(count,value), auto, max-content, min-content, <number>fr, <number>px, <number>vw, <number>vh, <number>%. No other values allowed. Nested minmax is not allowed
grid-flow-row
grid-flow-col
grid-flow-dense
grid-flow-row-dense
grid-flow-col-dense
auto-cols-auto
auto-cols-min
auto-cols-max
auto-cols-fr
auto-cols-[<value>]: <value>; Allowed values = minmax(value,value), repeat(count,value), auto, max-content, min-content, <number>fr, <number>px, <number>vw, <number>vh, <number>%. No other values allowed. Nested minmax is not allowed
auto-rows-auto
auto-rows-min
auto-rows-max
auto-rows-fr
auto-rows-[<value>]: <value>; Allowed values = minmax(value,value), repeat(count,value), auto, max-content, min-content, <number>fr, <number>px, <number>vw, <number>vh, <number>%. No other values allowed. Nested minmax is not allowed
justify-start
justify-center
justify-end
justify-between
justify-around
justify-evenly
items-start
items-center
items-end
items-stretch
content-start
content-center
content-end
content-between
content-around
content-evenly
justify-items-start
justify-items-center
justify-items-end
justify-items-stretch
gap-<number>
gap-x-<number>
gap-y-<number>
flex-row
flex-row-reverse
flex-col
flex-col-reverse
flex-nowrap
flex-wrap
flex-wrap-reverse
      

      - min width:
min-w-<number>
min-w-<fraction>
min-w-full
min-w-auto
min-w-3xs
min-w-2xs
min-w-xs
min-w-sm
min-w-md
min-w-lg
min-w-xl
min-w-2xl
min-w-3xl
min-w-4xl
min-w-5xl
min-w-6xl
min-w-7xl
min-w-screen
min-w-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
      

      - width:
w-<number>
w-<fraction>
w-auto
w-max
w-full
w-3xs
w-2xs
w-xs
w-sm
w-md
w-lg
w-xl
w-2xl
w-3xl
w-4xl
w-5xl
w-6xl
w-7xl
w-screen
w-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
max-w-<number>
max-w-<fraction>
max-w-none
max-w-full
max-w-auto
max-w-3xs
max-w-2xs
max-w-xs
max-w-sm
max-w-md
max-w-lg
max-w-xl
max-w-2xl
max-w-3xl
max-w-4xl
max-w-5xl
max-w-6xl
max-w-7xl
max-w-screen
max-w-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
      

      - min height:
min-h-<number>
min-h-<fraction>
min-h-auto
min-h-full
min-h-screen
min-h-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
      

      - height:
h-<number>
h-<fraction>
h-auto
h-full
h-screen
h-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
max-h-<number>
max-h-<fraction>
max-h-auto
max-h-none
max-h-full
max-h-screen
max-h-[<value>]: <value>; Allowed values = <number>px, <number>%, <number>vw, <number>vh. No other values allowed.
aspect-<fraction>
      

      - position:
m-<number>
mt-<number>
mb-<number>
ml-<number>
mr-<number>
mx-<number>
my-<number>
-m-<number>
-mt-<number>
-mb-<number>
-ml-<number>
-mr-<number>
-mx-<number>
-my-<number>
m-[<value>]: <value>; Allowed values = %, px. No other values allowed.
mt-[<value>]: <value>; Allowed values = %, px. No other values allowed.
mb-[<value>]: <value>; Allowed values = %, px. No other values allowed.
ml-[<value>]: <value>; Allowed values = %, px. No other values allowed.
mr-[<value>]: <value>; Allowed values = %, px. No other values allowed.
mx-[<value>]: <value>; Allowed values = %, px. No other values allowed.
my-[<value>]: <value>; Allowed values = %, px. No other values allowed.
m-auto
mt-auto
mb-auto
ml-auto
mr-auto
mx-auto
my-auto
col-span-<number>
col-start-<number>
col-end-<number>
row-span-<number>
row-start-<number>
row-end-<number>
basis-<number>
basis-<fraction>
basis-full
basis-auto
basis-3xs
basis-2xs
basis-xs
basis-sm
basis-md
basis-lg
basis-xl
basis-2xl
basis-3xl
basis-4xl
basis-5xl
basis-6xl
basis-7xl
grow
flex-grow
flex-grow-0
grow-<number>
shrink
shrink-<number>
flex-initial
flex-auto
flex-<number>
flex-<fraction>
self-start
self-center
self-end
justify-self-start
justify-self-center
justify-self-end
self-stretch
place-self-start
place-self-center
place-self-end
place-self-stretch
justify-self-stretch
      

      - rotation:
rotate-<number>
-rotate-<number>
      
  */
  
// Line Props
/* If using a \"brand\" prop, do not include a \"cssProperties\" or a \"cssCustomProperties\" prop to the line or it's inner elements. */
interface LineDataProps {
  direction?: 'rtl' | 'ltr' | 'auto';
}


interface LineCssCustomProperties {
  lineColor?: string; // <backgroundColor>
  lineSize?: string; // <length> \"Width\"
  doubleLineSize?: string; // <length> \"Second line width\"
  spaceBetween?: string; // <length> \"Spacing\"
  lineEnd?: 'None' | 'Square' | 'Triangle' /* Solid arrow */ | 'Circle' | 'Arrow'; // <customEnum> \"End\"
  lineStart?: 'None' | 'Square' | 'Triangle' /* Solid arrow */ | 'Circle' | 'Arrow'; // <customEnum> \"Start\"
  type?: 'Solid' | 'Dash' /* Dashes */ | 'Dot' /* Dots */ | 'DoubleLine' /* Double */ | 'Zigzag' /* Triangles */; // <customEnum> \"Type\"
  dashSize?: string; // <length> \"Dash size\"
}

type LinePreset =
  'vertical' // Vertical 
 | 'horizontal' // Horizontal;

export interface LineProps {
  brand?: 'system-line-1' | 'system-line-2';
  data?: LineDataProps;
  cssCustomProperties?: LineCssCustomProperties;
  preset?: LinePreset;
  classes?: string; // Supported Groups: The allowed classes groups for preset vertical : [min height, height, position, rotation], The allowed classes groups for preset horizontal : [min width, width, position, rotation]
  entranceAnimation?: EntranceAnimationType;
  loopAnimation?: LoopAnimationType;
  scrollAnimation?: ScrollAnimationType;
  mouseAnimation?: MouseAnimationType;
}
export type Line = (props: LineProps) => React.ReactNode;

// Image Props

interface ImageDataProps {
  priority?: 'high' | 'low'; // Priority;
  decorative?: boolean; // Decorative;
  image?: {
      width: number;
      height: number;
      uri: string;
      type: 'Builder.Image';
    }; // Image;
  displayMode?: 'fill' | 'fit' | 'fitWidth'; // Display Mode;
}


interface ImageCssCustomProperties {
  mix-blend-mode?: string; // <mixBlendMode> \"Blend Mode\"
  border-width?: string; // <borderWidth> \"Border Width\"
  border-radius?: string; // <borderRadius> \"Corner Radius\"
  border-color?: string; // <borderColor> \"Border Color\"
  opacity?: string; // <opacity> \"Opacity\"
  box-shadow?: string; // <boxShadow> \"Box Shadow\"
  border-style?: string; // <borderStyle> \"Border Style\"
}

interface ImageGenerationProps {
  hint: string;
}

export interface ImageProps {
  imageGeneration: ImageGenerationProps;
  data?: ImageDataProps;
  cssCustomProperties?: ImageCssCustomProperties;
  classes?: string; // Supported Groups: [min width, width, min height, height, position, rotation]
  entranceAnimation?: EntranceAnimationType;
  loopAnimation?: LoopAnimationType;
  scrollAnimation?: ScrollAnimationType;
  mouseAnimation?: MouseAnimationType;
}
export type Image = (props: ImageProps) => React.ReactNode;

// Button Props
/* NEVER use the Text component to display labels on buttons.
      If using a \"brand\" prop, do not include a \"cssProperties\" or a \"cssCustomProperties\" prop to the button or it's inner elements. */
interface ButtonDataProps {
  label?: string;
  direction?: 'rtl' | 'ltr' | 'auto';
  iconCollapsed?: boolean; // Display icon;
}


interface ButtonCssProperties {
  columnGap?: string;
  paddingInlineEnd?: string;
  borderStartEndRadius?: string;
  boxShadow?: string;
  background?: string;
  paddingInlineStart?: string;
  borderBottom?: string;
  borderInlineStart?: string;
  borderTop?: string;
  rowGap?: string;
  borderInlineEnd?: string;
  paddingTop?: string;
  borderStartStartRadius?: string;
  paddingBottom?: string;
  borderEndStartRadius?: string;
  borderEndEndRadius?: string;
  display?: 'none' | 'flex'; // default value: flex
}


interface ButtonCssCustomProperties {
  icon-position?: 'row' /* Before text */ | 'row-reverse' /* After text */ | 'column' /* Below text */ | 'column-reverse' /* Above text */; // <customEnum> \"Icon position\"
  content-horizontal-alignment?: string; // <justifyContent> \"Alignment\"
}

type ButtonPreset =
  'baseButton' // Base Button;


interface ButtonLabelCssProperties {
  textDecorationLine?: string;
  backgroundColor?: string;
  textTransform?: string;
  color?: string;
  textAlign?: string;
  font?: string;
  letterSpacing?: string;
  lineHeight?: string;
  display?: 'none' | 'block';
}


interface ButtonLabelCssCustomProperties {
  text-shadow?: string; // <textShadow>
}


interface ButtonLabelDataProps {
}


interface ButtonAnimatedIconCssProperties {
  display?: 'none' | 'block';
}


interface ButtonAnimatedIconCssCustomProperties {
  fill?: string; // <color> \"Color\"
  size?: string; // <length> \"Size\"
  rotation?: string; // <angle> \"Rotation\"
}


interface ButtonAnimatedIconDataProps {
  duration?: number; // default value: 0.2
}


interface ButtonElements {
  'label'?: { data?: ButtonLabelDataProps; cssProperties?: ButtonLabelCssProperties; cssCustomProperties?: ButtonLabelCssCustomProperties; };
  'animatedIcon'?: { data?: ButtonAnimatedIconDataProps; cssProperties?: ButtonAnimatedIconCssProperties; cssCustomProperties?: ButtonAnimatedIconCssCustomProperties; };
}

export interface ButtonProps {
  brand?: 'button-primary' | 'button-secondary' | 'button-tertiary';
  data?: ButtonDataProps;
  cssProperties?: ButtonCssProperties;
  cssCustomProperties?: ButtonCssCustomProperties;
  elements?: ButtonElements;
  preset?: ButtonPreset;
  classes?: string; // Supported Groups: [min width, width, min height, height, position, rotation]
  entranceAnimation?: EntranceAnimationType;
  loopAnimation?: LoopAnimationType;
  scrollAnimation?: ScrollAnimationType;
  mouseAnimation?: MouseAnimationType;
}
export type Button = (props: ButtonProps) => React.ReactNode;

// Container Props
/* If using a \"brand\" prop, do not include a \"cssProperties\" or a \"cssCustomProperties\" prop to the box container or it's inner elements. */
interface ContainerDataProps {
}


interface ContainerCssCustomProperties {
  borderBottomStyle?: string; // <borderBottomStyle>
  borderBottomWidth?: string; // <borderBottomWidth>
  borderBottomColor?: string; // <borderBottomColor>
  borderStartEndRadius?: string; // <borderStartEndRadius>
  boxShadow?: string; // <boxShadow>
  borderInlineEndWidth?: string; // <borderInlineEndWidth>
  borderTopWidth?: string; // <borderTopWidth>
  borderInlineStartColor?: string; // <borderInlineStartColor>
  borderStartStartRadius?: string; // <borderStartStartRadius>
  borderInlineStartWidth?: string; // <borderInlineStartWidth>
  borderTopStyle?: string; // <borderTopStyle>
  borderEndStartRadius?: string; // <borderEndStartRadius>
  borderInlineStartStyle?: string; // <borderInlineStartStyle>
  borderInlineEndStyle?: string; // <borderInlineEndStyle>
  borderInlineEndColor?: string; // <borderInlineEndColor>
  borderTopColor?: string; // <borderTopColor>
  borderEndEndRadius?: string; // <borderEndEndRadius>
}


interface ContainerElements {
  Background?: BackgroundProps;
}

export interface ContainerProps {
  brand?: 'box-primary' | 'box-secondary';
  data?: ContainerDataProps;
  cssCustomProperties?: ContainerCssCustomProperties;
  elements?: ContainerElements;
  classes?: string; // Supported Groups: [containers, min width, width, min height, height, position, rotation]
  entranceAnimation?: EntranceAnimationType;
  loopAnimation?: LoopAnimationType;
  scrollAnimation?: ScrollAnimationType;
  mouseAnimation?: MouseAnimationType;
}
export type Container = (props: ContainerProps) => React.ReactNode;

// Text Props

interface TextDataProps {
  richText?: richText;
}


interface TextCssProperties {
  backgroundColor?: string;
  textTransform?: string;
  textDecoration?: string;
  color?: string;
  textAlign?: string;
  font?: string;
  letterSpacing?: string; // default value: 0em
  writingMode?: string;
  mixBlendMode?: string; // default value: normal
}


interface TextCssCustomProperties {
  textShadow?: string; // <textShadow>
  textOutline?: string; // <textShadow>
}

type TextPreset =
  'vertical' // Vertical 
 | 'horizontal' // Horizontal;

export interface TextProps {
  data?: TextDataProps;
  cssProperties?: TextCssProperties;
  cssCustomProperties?: TextCssCustomProperties;
  preset?: TextPreset;
  classes?: string; // Supported Groups: The allowed classes groups for preset vertical : [min height, height, position, rotation, text], The allowed classes groups for preset horizontal : [min width, width, position, rotation, text]
  entranceAnimation?: EntranceAnimationType;
  loopAnimation?: LoopAnimationType;
  scrollAnimation?: ScrollAnimationType;
  mouseAnimation?: MouseAnimationType;
}
export type Text = (props: TextProps) => React.ReactNode;
"