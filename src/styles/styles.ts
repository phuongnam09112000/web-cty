import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

/* ─── Tokens ─────────────────────────────────── */
const { colors, fonts, breakpoints, radii, shadows, space, layout } = theme;
const blue     = colors.primary;
const blueDeep = colors.navy;

export const Styles = createGlobalStyle`
  /* ─── Design tokens as CSS custom properties ─
   * Prefixed with --istt- so they do not collide with the header's
   * existing --brand / --text-* variables. */
  :root {
    --istt-color-primary: ${colors.primary};
    --istt-color-primary-dark: ${colors.primaryDark};
    --istt-color-primary-alt: ${colors.primaryAlt};
    --istt-color-secondary: ${colors.secondary};
    --istt-color-secondary-light: ${colors.secondaryLight};
    --istt-color-navy: ${colors.navy};
    --istt-color-text: ${colors.text};
    --istt-color-text-body: ${colors.textBody};
    --istt-color-text-muted: ${colors.textMuted};
    --istt-color-border: ${colors.border};
    --istt-color-surface: ${colors.surface};
    --istt-color-surface-subtle: ${colors.surfaceSubtle};
    --istt-color-surface-muted: ${colors.surfaceMuted};
    --istt-color-success: ${colors.success};
    --istt-color-error: ${colors.error};
    --istt-focus-ring: ${colors.focusRing};
    --istt-focus-ring-inverse: ${colors.focusRingInverse};
    --istt-font-body: ${fonts.body};
    --istt-font-heading: ${fonts.heading};
    --istt-radius-sm: ${radii.sm};
    --istt-radius-md: ${radii.md};
    --istt-radius-lg: ${radii.lg};
    --istt-shadow-sm: ${shadows.sm};
    --istt-shadow-md: ${shadows.md};
    --istt-shadow-lg: ${shadows.lg};
  }

  /* ─── Reset ───────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body, html {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: #fff;
    overflow-x: hidden;
  }

  /* ─── Base typography ────────────────────── */
  body, html, a, p, span, li, td, th, label, input, textarea, button {
    font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
    color: ${blueDeep};
  }

  /* Labels inside a button follow the button's own text colour; the rule
     above would otherwise paint them dark navy on dark/brand-blue buttons. */
  button span {
    color: inherit;
  }

  p {
    font-size: 15px;
    line-height: 1.8;
    color: #4a6070;
    margin: 0 0 1em;
    letter-spacing: 0.01em;
  }

  /* ─── Headings — shared ──────────────────── */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lora', 'Georgia', serif;
    color: ${blueDeep};
    line-height: 1.15;
    margin: 0 0 0.5em;
    font-weight: 700;
  }

  /* ─── h1 ─────────────────────────────────── */
  h1 {
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.03em;

    @media (max-width: ${breakpoints.lg}px) { font-size: 48px; letter-spacing: -0.025em; }
    @media (max-width: ${breakpoints.md}px)  { font-size: 38px; letter-spacing: -0.02em;  }
    @media (max-width: ${breakpoints.xs}px)  { font-size: 30px; letter-spacing: -0.015em; }
  }

  /* ─── h2 ─────────────────────────────────── */
  h2 {
    font-size: 40px;
    font-weight: 800;
    letter-spacing: -0.025em;

    @media (max-width: ${breakpoints.lg}px) { font-size: 34px; letter-spacing: -0.02em;  }
    @media (max-width: ${breakpoints.md}px)  { font-size: 28px; letter-spacing: -0.015em; }
    @media (max-width: ${breakpoints.xs}px)  { font-size: 24px; letter-spacing: -0.01em;  }
  }

  /* ─── h3 ─────────────────────────────────── */
  h3 {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.015em;

    @media (max-width: ${breakpoints.md}px) { font-size: 22px; letter-spacing: -0.01em;  }
    @media (max-width: ${breakpoints.xs}px) { font-size: 19px; letter-spacing: -0.005em; }
  }

  /* ─── h4 ─────────────────────────────────── */
  h4 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;

    @media (max-width: ${breakpoints.md}px) { font-size: 17px; }
  }

  /* ─── h5 ─────────────────────────────────── */
  h5 {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.005em;
  }

  /* ─── h6 ─────────────────────────────────── */
  h6 {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
  }

  /* ─── Links ──────────────────────────────── */
  a {
    text-decoration: none;
    color: ${blue};
    transition: color 0.2s ease;

    &:hover { color: ${blueDeep}; }
  }

  /* ─── Form elements ──────────────────────── */
  input, textarea {
    border-radius: 0;
    border: 1px solid #d8e8f2;
    background: #f5f9fc;
    font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
    font-size: 14px;
    letter-spacing: 0.01em;
    transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    width: 100%;
    padding: 12px 16px;
    color: ${blueDeep};

    &::placeholder {
      color: ${colors.textMuted};
      font-style: italic;
      letter-spacing: 0.02em;
    }

    &:focus {
      background: #fff;
      border-color: ${blue};
      box-shadow: 0 0 0 3px rgba(14, 93, 149, 0.08);
    }
  }

  /* ─── Focus ──────────────────────────────── */
  /* Mouse / touch focus keeps the previous look (no outline). Keyboard
   * focus always gets a visible ring. Browsers without :focus-visible
   * support ignore both rules and fall back to their default outline. */
  :focus:not(:focus-visible) { outline: none; }

  /* !important so component-level "outline: none" rules cannot hide it. */
  :focus-visible {
    outline: 2px solid var(--istt-focus-ring) !important;
    outline-offset: 2px !important;
  }

  /* Dark surfaces (footer, or any element marked .istt-on-dark). */
  footer :focus-visible,
  .istt-on-dark :focus-visible {
    outline-color: var(--istt-focus-ring-inverse) !important;
  }

  /* Narrow exceptions (higher specificity than the rule above):
   * 1. Text fields clicked or tapped into. Browsers match :focus-visible on
   *    text fields even on mouse click, and every text input / textarea here
   *    already switches to a ${colors.primary} border on focus (global input
   *    rule, FormContact, ContactForm). common/utils/focusSource.ts marks a
   *    field with data-istt-pointer-focus only while it holds focus that came
   *    from a mouse / touch press; only then is the ring dropped. Keyboard,
   *    assistive-technology and script focus keep the ring.
   *    Checkboxes, radios, buttons and other input types are not affected. */
  input[data-istt-pointer-focus]:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="file"]):not([type="range"]):not([type="color"]):focus-visible,
  textarea[data-istt-pointer-focus]:focus-visible {
    outline: none !important;
  }

  /* 2. Ant Design Modal internals (rc-dialog): the 0×0 focus sentinels that
   *    are direct children of .ant-modal, and the full-screen .ant-modal-wrap.
   *    Neither is a user-facing control. */
  .ant-modal > div[tabindex="0"]:focus-visible,
  .ant-modal-wrap:focus-visible {
    outline: none !important;
  }

  /* ─── Accessibility utilities ────────────── */
  /* Visually hidden but still read by screen readers. */
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* "Skip to main content" link: hidden until focused with the keyboard. */
  .skip-link {
    position: fixed;
    top: ${space[2]};
    left: ${space[2]};
    z-index: 2000;
    padding: ${space[3]} ${space[4]};
    background: var(--istt-color-surface);
    color: var(--istt-color-primary);
    font-family: var(--istt-font-body);
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--istt-radius-md);
    box-shadow: var(--istt-shadow-md);
    transform: translateY(-200%);
    transition: transform 0.2s ease;

    &:focus,
    &:focus-visible {
      transform: translateY(0);
    }
  }

  /* The <main> landmark receives programmatic focus from the skip link;
   * it is not an interactive control, so no ring is drawn on it. */
  #main-content:focus { outline: none !important; }

  /* Keep the skip-link target clear of the fixed header when scrolled to. */
  #main-content {
    scroll-margin-top: ${layout.headerHeight};

    @media (max-width: ${breakpoints.md}px) {
      scroll-margin-top: ${layout.headerHeightMobile};
    }
  }

  /* ─── Reduced motion ─────────────────────── */
  /* Users who ask the OS for less motion get near-instant CSS animations
   * and transitions. Fill modes are untouched, so elements still end in
   * their final (visible) state. JS-driven motion (GSAP, Swiper autoplay)
   * is not covered here. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* ─── Ant Design overrides ───────────────── */
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    text-align: left;
    padding-top: 1.5rem;
    font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  }

  .ant-drawer-content-wrapper {
    width: 300px !important;
  }

  /* ─── Misc ───────────────────────────────── */
  .about-block-image svg {
    text-align: center;
  }
`;