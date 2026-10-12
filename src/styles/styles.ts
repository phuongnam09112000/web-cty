import { createGlobalStyle } from "styled-components";

/* ─── Tokens ─────────────────────────────────── */
const blue     = "#0e5d95";
const blueDeep = "#0d1b2a";

export const Styles = createGlobalStyle`
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

    @media (max-width: 1024px) { font-size: 48px; letter-spacing: -0.025em; }
    @media (max-width: 768px)  { font-size: 38px; letter-spacing: -0.02em;  }
    @media (max-width: 480px)  { font-size: 30px; letter-spacing: -0.015em; }
  }

  /* ─── h2 ─────────────────────────────────── */
  h2 {
    font-size: 40px;
    font-weight: 800;
    letter-spacing: -0.025em;

    @media (max-width: 1024px) { font-size: 34px; letter-spacing: -0.02em;  }
    @media (max-width: 768px)  { font-size: 28px; letter-spacing: -0.015em; }
    @media (max-width: 480px)  { font-size: 24px; letter-spacing: -0.01em;  }
  }

  /* ─── h3 ─────────────────────────────────── */
  h3 {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.015em;

    @media (max-width: 768px) { font-size: 22px; letter-spacing: -0.01em;  }
    @media (max-width: 480px) { font-size: 19px; letter-spacing: -0.005em; }
  }

  /* ─── h4 ─────────────────────────────────── */
  h4 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;

    @media (max-width: 768px) { font-size: 17px; }
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
    outline: none;
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
    outline: none;
    width: 100%;
    padding: 12px 16px;
    color: ${blueDeep};

    &::placeholder {
      color: #9ab0c2;
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
  *:focus { outline: none; }

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