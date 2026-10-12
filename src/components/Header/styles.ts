import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { theme } from "../../styles/theme";

// ─── Global ───────────────────────────────────────────────────────────────────
export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,800;1,700&family=DM+Mono:wght@500&family=Source+Serif+4&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :root {
    --brand: rgb(13, 58, 115);
    --brand-light: #1a4fa0;
    --brand-dim: rgba(13, 58, 115, 0.08);
    --text-primary: #0d1117;
    --text-secondary: #4a5568;
    --text-muted: #9aa5b4;
    --border: rgba(0, 0, 0, 0.07);
    --surface: rgba(255, 255, 255, 0.97);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
    --shadow-lg: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    --radius: 10px;
    --font: 'DM Sans', -apple-system, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// Same values as before (768px / 1024px), now sourced from the shared tokens
export const breakpoints = {
  mobile: `${theme.breakpoints.md}px`,
  tablet: `${theme.breakpoints.lg}px`,
};

// ─── Keyframes ────────────────────────────────────────────────────────────────
export const fadeSlideDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ─── Header Shell ─────────────────────────────────────────────────────────────
export const HeaderContainer = styled.header<{ $scrolled?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6rem;
  height: 72px;
  background: var(--surface);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  position: fixed;
  top: 0; left: 0; right: 0;
  width: 100%;
  z-index: 1000;
  font-family: var(--font);
  font-size: 16px;
  will-change: box-shadow, background;
  transition:
    box-shadow var(--transition),
    background var(--transition);

  /* Subtle bottom line that appears on scroll */
  &::after {
    content: "";
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--border) 20%,
      var(--border) 80%,
      transparent 100%
    );
    opacity: ${p => p.$scrolled ? 1 : 0};
    transition: opacity var(--transition);
  }

  ${p => p.$scrolled && css`
    box-shadow: var(--shadow-md);
    background: rgba(255,255,255,0.99);
  `}

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0 2.5rem;
  }
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 1.25rem;
    height: 64px;
  }
`;

export const ContentSpacer = styled.div`
  height: 72px;
  width: 100%;
  @media (max-width: ${breakpoints.mobile}) {
    height: 64px;
  }
`;

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity var(--transition), transform var(--transition);

  &:hover {
    opacity: 0.82;
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }

  img {
    height: 42px;
    display: block;
    @media (max-width: ${breakpoints.mobile}) { height: 34px; }
  }
`;

// ─── Desktop Nav ──────────────────────────────────────────────────────────────
export const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  height: 100%;
  font-family: var(--font);
  gap: 0;

  @media (max-width: ${breakpoints.tablet}) { display: none; }
`;

// Shared underline indicator
const underlineBar = css<{ $active?: boolean; $lit?: boolean }>`
  &::before {
    content: "";
    position: absolute;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--brand);
    width: ${p => (p.$active || p.$lit) ? '55%' : '0'};
    transition: width var(--transition);
  }
`;

export const NavItemLink = styled(Link)<{
  $active: boolean;
  $isHovered: boolean;
  $isAnyHovered: boolean;
}>`
  position: relative;
  padding: 0 1.05rem;
  height: 72px;
  display: flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    color var(--transition),
    opacity var(--transition);

  color: ${p => (p.$isHovered || p.$active) ? 'var(--brand)' : 'var(--text-primary)'};
  opacity: ${p => p.$isAnyHovered ? (p.$isHovered ? 1 : 0.38) : 1};

  ${underlineBar}
  ${p => css`
    &::before { width: ${(p.$isHovered || p.$active) ? '55%' : '0'}; }
  `}
`;

// Native <button> reset so interactive triggers keep their previous look
const buttonReset = css`
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  line-height: inherit;
  text-align: inherit;
`;

export const NavDropdown = styled.button<{
  $active: boolean;
  $isHovered: boolean;
  $isAnyHovered: boolean;
  $isDropdownOpen: boolean;
}>`
  ${buttonReset}
  position: relative;
  padding: 0 1.05rem;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  transition:
    color var(--transition),
    opacity var(--transition);

  color: ${p =>
    (p.$isHovered || p.$isDropdownOpen || p.$active)
      ? 'var(--brand)'
      : 'var(--text-primary)'};
  opacity: ${p =>
    p.$isAnyHovered
      ? (p.$isHovered || p.$isDropdownOpen) ? 1 : 0.38
      : 1};

  ${underlineBar}
  ${p => css`
    &::before {
      width: ${(p.$isHovered || p.$isDropdownOpen || p.$active) ? '55%' : '0'};
    }
  `}

  .arrow-icon {
    font-size: 8px;
    margin-top: 1px;
    transition: transform var(--transition);
    transform: ${p =>
      (p.$isHovered || p.$isDropdownOpen)
        ? 'rotate(180deg)'
        : 'rotate(0deg)'};
    opacity: 0.65;
  }
`;

// ─── Dropdown Menus ───────────────────────────────────────────────────────────
const dropdownShared = css`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  overflow: hidden;
  animation: ${fadeSlideDown} 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
  font-family: var(--font);

  .ant-dropdown-menu-item {
    padding: 0;
    border-radius: 7px;
    overflow: hidden;
    transition: background var(--transition);
    margin: 1px 0;

    &:hover { background: var(--brand-dim); }

    a {
      display: block;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font);
      color: var(--text-primary);
      text-decoration: none;
      transition: color var(--transition);

      &:hover { color: var(--brand); }
    }
  }
`;

export const ServiceSubmenu = styled(Menu)`
  ${dropdownShared}
  width: 290px;
`;

export const LanguageMenu = styled(Menu)`
  ${dropdownShared}
  min-width: 155px;

  .ant-dropdown-menu-item {
    a, & > div {
      padding: 9px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
    }
  }
`;

// ─── Language Selector ────────────────────────────────────────────────────────
export const LanguageSelector = styled.button<{
  $isHovered: boolean;
  $isAnyHovered: boolean;
  $isDropdownOpen: boolean;
}>`
  ${buttonReset}
  margin-left: 0.75rem;
  padding: 0 0.85rem;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-left: 1px solid var(--border);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--transition), opacity var(--transition);

  color: ${p =>
    (p.$isHovered || p.$isDropdownOpen) ? 'var(--brand)' : 'var(--text-primary)'};
  opacity: ${p =>
    p.$isAnyHovered
      ? (p.$isHovered || p.$isDropdownOpen) ? 1 : 0.38
      : 1};
`;

export const FlagIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  width: 18px;
  height: 13px;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
  overflow: hidden;
`;

export const AnimatedDropdownWrapper = styled.div``;

// ─── Mobile Toggle ────────────────────────────────────────────────────────────
export const MobileNavToggle = styled.button`
  /* native <button> reset — keeps the previous look */
  border: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  line-height: 1;
  appearance: none;
  -webkit-appearance: none;

  display: none;
  cursor: pointer;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 17px;
  background: #f4f6f9;
  transition: background var(--transition), color var(--transition), transform var(--transition);
  flex-shrink: 0;

  &:hover {
    background: var(--brand-dim);
    color: var(--brand);
    transform: scale(1.04);
  }
  &:active { transform: scale(0.97); }

  @media (max-width: ${breakpoints.tablet}) { display: flex; }
`;

// ─── Mobile Overlay ───────────────────────────────────────────────────────────
export const MobileNavOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(8, 16, 40, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 1001;
  transition: opacity var(--transition), visibility var(--transition);
  opacity: ${p => p.$isOpen ? 1 : 0};
  visibility: ${p => p.$isOpen ? 'visible' : 'hidden'};
`;

// ─── Mobile Panel ─────────────────────────────────────────────────────────────
export const MobileNavContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${p => p.$isOpen ? '0' : '-310px'};
  width: 290px;
  height: 100dvh;
  background: #fff;
  z-index: 1002;
  /* hidden panel is removed from the tab order once it has slid out */
  visibility: ${p => p.$isOpen ? 'visible' : 'hidden'};
  transition:
    right 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s linear ${p => p.$isOpen ? '0s' : '0.32s'};
  box-shadow: -12px 0 48px rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  font-family: var(--font);
`;

export const MobileNavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  height: 64px;
  border-bottom: 1px solid #f2f4f8;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
`;

export const MobileNavItems = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0.5rem 0;
`;

export const MobileNavItem = styled.div`
  border-bottom: 1px solid #f5f7fb;

  &:last-child { border-bottom: none; }
`;

export const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  height: 52px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition), background var(--transition), padding-left var(--transition);

  &:hover {
    color: var(--brand);
    background: var(--brand-dim);
    padding-left: 1.5rem;
  }
`;

export const MobileNavDropdown = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  height: 52px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  transition: color var(--transition), background var(--transition);

  &:hover {
    color: var(--brand);
    background: var(--brand-dim);
  }
`;

export const MobileSubMenu = styled.div<{ $isOpen: boolean }>`
  background: #f9fafd;
  max-height: ${p => p.$isOpen ? '320px' : '0'};
  overflow: hidden;
  /* collapsed links leave the tab order (matches aria-expanded="false") */
  visibility: ${p => p.$isOpen ? 'visible' : 'hidden'};
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s linear ${p => p.$isOpen ? '0s' : '0.3s'};
`;

export const MobileSubMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0 1.25rem 0 2.25rem;
  height: 46px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font);
  color: var(--text-secondary);
  text-decoration: none;
  position: relative;
  transition: color var(--transition), background var(--transition);

  &::before {
    content: "";
    position: absolute;
    left: 1.25rem;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.4;
    transition: opacity var(--transition), transform var(--transition);
  }

  &:hover {
    color: var(--brand);
    background: rgba(13,58,115,0.05);

    &::before {
      opacity: 1;
      transform: scale(1.3);
    }
  }
`;

// ─── Mobile Language ──────────────────────────────────────────────────────────
export const MobileLanguageSelector = styled.div`
  padding: 1rem 1.25rem 1.5rem;
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid #f2f4f8;
`;

export const MobileLanguageHeader = styled.div`
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font);
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const MobileLanguageOptions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const MobileLanguageOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font);
  letter-spacing: 0.01em;
  transition: all var(--transition);
  flex: 1;
  justify-content: center;

  background: ${p => p.$active ? 'var(--brand)' : '#f0f2f7'};
  color: ${p => p.$active ? '#fff' : 'var(--text-secondary)'};
  box-shadow: ${p => p.$active ? '0 3px 10px rgba(13,58,115,0.28)' : 'none'};
  transform: ${p => p.$active ? 'translateY(-1px)' : 'none'};

  &:hover {
    background: ${p => p.$active ? 'var(--brand-light)' : '#e4e8f2'};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;