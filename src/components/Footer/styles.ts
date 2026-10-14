import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import { SectionInner, stackedMedia, mobileMedia } from "../../styles/section";

const { colors, fonts, typeScale } = theme;

/* ── Tokens ─────────────────────────────────── */
const dim = "rgba(255,255,255,0.72)";    // body text, ≥ 7:1 on the footer navy
const faint = "rgba(255,255,255,0.6)";   // copyright, ≥ 5:1
const divider = "rgba(255,255,255,0.12)";

/* ── Shell ──────────────────────────────────── */
export const FooterSection = styled.footer`
  background: ${colors.navyDeep};
  width: 100%;
  font-family: ${fonts.display};
`;

export const FooterTop = styled.div`
  padding: 72px 0 56px;
  border-bottom: 1px solid ${divider};

  ${mobileMedia} { padding: 48px 0 36px; }
`;

export const FooterBottom = styled.div`
  padding: 24px 0;
`;

// Same content column as the page sections above
export const Inner = SectionInner;

/* ── Top grid ───────────────────────────────── */
export const TopGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 2fr) minmax(0, 2fr) minmax(0, 4fr);
  gap: 48px;
  align-items: start;

  ${stackedMedia} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 40px 32px;
  }

  ${mobileMedia} {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
`;

/* ── Logo column ────────────────────────────── */
export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  ${stackedMedia} { grid-column: 1 / -1; }
`;

export const LogoLink = styled(Link)`
  display: inline-block;
  align-self: flex-start;
`;

export const Logo = styled.img`
  display: block;
  height: 64px;
  width: auto;
  /* white logo on the dark footer */
  filter: brightness(0) invert(1);

  ${mobileMedia} { height: 52px; }
`;

export const Tagline = styled.p`
  margin: 0;
  font-family: ${fonts.display};
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0;
  color: ${dim};
`;

/* ── Nav columns ────────────────────────────── */
export const NavCol = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ColLabel = styled.h2`
  margin: 0 0 4px;
  font-family: ${fonts.display};
  font-size: ${typeScale.label.size};
  font-weight: ${typeScale.label.weight};
  line-height: 1.5;
  letter-spacing: ${typeScale.label.tracking};
  text-transform: uppercase;
  color: ${colors.secondaryLight};
`;

export const NavLinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: -6px 0; /* offsets the link padding so the column keeps its rhythm */
`;

export const NavLinkItem = styled.li``;

export const NavLink = styled(Link)`
  display: inline-block;
  padding: 6px 0; /* 32px tap target */
  font-family: ${fonts.display};
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: ${dim};
  text-decoration: none;
  transition: color 0.18s ease;

  &:hover {
    color: ${colors.white};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

/* ── Contact column ─────────────────────────── */
export const ContactCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContactList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ContactItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const ContactIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 3px;
  filter: brightness(0) invert(1);
  opacity: 0.6;
`;

export const ContactText = styled.span`
  font-family: ${fonts.display};
  font-size: 15px;
  line-height: 1.6;
  color: ${dim};
`;

/* ── Bottom bar ─────────────────────────────── */
export const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  ${mobileMedia} {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
`;

export const Copyright = styled.p`
  margin: 0;
  font-family: ${fonts.display};
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0.01em;
  color: ${faint};
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid ${divider};
  border-radius: 2px;
  color: ${dim};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: ${colors.white};
    border-color: rgba(255,255,255,0.4);
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;
