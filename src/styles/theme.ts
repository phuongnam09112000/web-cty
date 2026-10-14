/* ─── Shared design tokens ─────────────────────────────────────────────────
 * Single source of truth for colours, typography, spacing, radii, shadows
 * and breakpoints. Values are taken from the existing styles; nothing here
 * changes the brand identity.
 *
 * NOTE: the codebase currently uses two brand blues — #0e5d95 (most
 * components) and rgb(13, 58, 115) / #0d3a73 (header). Neither has been
 * confirmed as the official brand colour, so both are kept as-is.
 */

const colors = {
  /* Brand — existing values, official choice pending confirmation */
  primary: "#0e5d95",        // most-used blue across components
  primaryDark: "#084b7a",    // hover / pressed shade already in use
  primaryAlt: "#0d3a73",     // header blue, rgb(13, 58, 115)
  secondary: "#4da3e0",      // light accent (decorative / on dark only)
  secondaryLight: "#7ec8f4", // light accent with high contrast on navy

  /* Neutrals */
  navy: "#0d1b2a",           // headings, dark sections
  navyDeep: "#0b1728",       // footer / hero overlays
  text: "#0d1b2a",
  textBody: "#4a6070",       // 6.6:1 on white
  textMuted: "#5a7080",      // ≥ 4.5:1 on white
  border: "#d8e8f2",
  surface: "#ffffff",
  surfaceSubtle: "#f5f9fc",
  surfaceMuted: "#eaf3fb",
  white: "#ffffff",

  /* Status */
  success: "#2e9e5b",
  error: "#d64545",

  /* Focus */
  focusRing: "#0e5d95",        // on light backgrounds (7:1 on white)
  focusRingInverse: "#7ec8f4", // on dark backgrounds (9.5:1 on navy)
} as const;

/* One family for the whole site. Be Vietnam Pro covers Vietnamese stacked
 * diacritics; the fallbacks (Segoe UI, Roboto, Arial) also support Vietnamese
 * if the web font is slow or blocked. `heading` and `display` are kept as
 * aliases so existing code keeps working. */
const fontStack = "'Be Vietnam Pro', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const fonts = {
  body: fontStack,
  heading: fontStack,
  display: fontStack,
} as const;

/* Site-wide type scale: one entry per text role, with desktop / tablet
 * (≤ 1024px) / mobile (≤ 768px) sizes. Heading line heights stay ≥ 1.2 so
 * stacked Vietnamese diacritics (ệ, ổ, ữ…) never clip or collide. An optional
 * `xs` size applies on phones ≤ 480px. Applied through the `type` mixins in
 * styles/typography.ts. */
const typeScale = {
  display: { desktop: "56px", tablet: "46px", mobile: "34px", lineHeight: 1.18, weight: 700, tracking: "-0.02em" },
  h1:      { desktop: "44px", tablet: "38px", mobile: "30px", xs: "26px", lineHeight: 1.2, weight: 700, tracking: "-0.02em" },
  h2:      { desktop: "34px", tablet: "30px", mobile: "26px", lineHeight: 1.25, weight: 700, tracking: "-0.015em" },
  h3:      { desktop: "22px", tablet: "20px", mobile: "19px", lineHeight: 1.35, weight: 600, tracking: "-0.005em" },
  h4:      { desktop: "18px", tablet: "17px", mobile: "16px", lineHeight: 1.4,  weight: 600, tracking: "0" },
  lead:    { desktop: "20px", tablet: "18px", mobile: "17px", lineHeight: 1.65, weight: 400, tracking: "0" },
  body:    { desktop: "16px", tablet: "16px", mobile: "16px", lineHeight: 1.7,  weight: 400, tracking: "0" },
  small:   { desktop: "14px", tablet: "14px", mobile: "14px", lineHeight: 1.6,  weight: 400, tracking: "0" },
  caption: { desktop: "13px", tablet: "13px", mobile: "13px", lineHeight: 1.5,  weight: 400, tracking: "0.01em" },
  label:   { desktop: "13px", tablet: "13px", mobile: "12px", lineHeight: 1.5,  weight: 600, tracking: "0.08em", size: "13px" },
  nav:     { desktop: "14px", tablet: "14px", mobile: "14px", lineHeight: 1.4,  weight: 600, tracking: "0.04em" },
  button:  { desktop: "15px", tablet: "15px", mobile: "15px", xs: "14px", lineHeight: 1.3, weight: 600, tracking: "0.02em" },
} as const;

export type TypeRole = keyof typeof typeScale;

/* Homepage-only heading sizes (the approved homepage hierarchy). Line height,
 * weight and tracking still come from the display and h2 roles above; only
 * the sizes are larger, so the rest of the site keeps the shared scale. */
const homeScale = {
  hero:    { desktop: "64px", tablet: "48px", mobile: "36px" },
  section: { desktop: "48px", tablet: "36px", mobile: "28px" },
} as const;

/* Image overlays that keep white text legible on photography */
const overlays = {
  heroSide:
    "linear-gradient(90deg, rgba(11,23,40,0.86) 0%, rgba(11,23,40,0.62) 45%, rgba(11,23,40,0.18) 100%)",
  heroBottom:
    "linear-gradient(0deg, rgba(11,23,40,0.92) 0%, rgba(11,23,40,0.62) 55%, rgba(11,23,40,0.30) 100%)",
  headerScrim: "linear-gradient(180deg, rgba(11,23,40,0.55) 0%, rgba(11,23,40,0) 100%)",
} as const;

const fontSizes = {
  xs: "12px",
  sm: "14px",
  base: "15px",
  md: "16px",
  lg: "20px",
  xl: "26px",
  "2xl": "40px",
  "3xl": "56px",
} as const;

const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/* 4px base grid */
const space = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  12: "48px",
  16: "64px",
  24: "96px",
} as const;

const radii = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "10px",
  pill: "999px",
  round: "50%",
} as const;

const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
  lg: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
} as const;

/* Most-used breakpoints in the existing styles (max-width queries). */
const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1300,
} as const;

type BreakpointKey = keyof typeof breakpoints;

/* `${media.down("md")} { ... }` → @media (max-width: 768px) */
const media = {
  down: (bp: BreakpointKey) => `@media (max-width: ${breakpoints[bp]}px)`,
  up: (bp: BreakpointKey) => `@media (min-width: ${breakpoints[bp] + 1}px)`,
} as const;

const layout = {
  maxWidth: "1300px",
  headerHeight: "72px",
  headerHeightMobile: "64px",
  /* Redesign content column and side margins (desktop / tablet / mobile) */
  contentMaxWidth: "1280px",
  pagePadding: { desktop: "48px", tablet: "32px", mobile: "20px" },
} as const;

const transitions = {
  base: "0.22s cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const theme = {
  colors,
  fonts,
  typeScale,
  homeScale,
  overlays,
  fontSizes,
  fontWeights,
  space,
  radii,
  shadows,
  breakpoints,
  media,
  layout,
  transitions,
} as const;

export type AppTheme = typeof theme;

export default theme;
