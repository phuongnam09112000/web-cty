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

const fonts = {
  body: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  heading: "'Lora', 'Georgia', serif",
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
} as const;

const transitions = {
  base: "0.22s cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const theme = {
  colors,
  fonts,
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
