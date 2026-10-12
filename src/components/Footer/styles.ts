import styled from "styled-components";
import { Link } from "react-router-dom";

/* ── Tokens ─────────────────────────────────── */
const bg       = "#0b1728";
const bgTop    = "#0e1e33";
const accent   = "#3b9de0";
const dim      = "rgba(255,255,255,0.45)";
const divider  = "rgba(255,255,255,0.08)";

/* ── Shell ──────────────────────────────────── */
export const FooterSection = styled.footer`
  background: ${bg};
  width: 100%;
  font-family: 'DM Sans', sans-serif;
`;

/* Top band with slightly lighter bg */
export const FooterTop = styled.div`
  background: ${bgTop};
  border-bottom: 1px solid ${divider};
  padding: 56px 0 48px;

  @media (max-width: 768px) { padding: 40px 0 32px; }
`;

export const FooterBottom = styled.div`
  padding: 20px 0;
`;

export const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;

  @media (max-width: 768px) { padding: 0 24px; }
  @media (max-width: 480px) { padding: 0 16px; }
`;

/* ── Top grid ───────────────────────────────── */
export const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr 1fr 1.6fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 180px 1fr 1fr 1.4fr;
    gap: 32px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 36px 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

/* ── Logo column ────────────────────────────── */
export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${divider};
  }
`;

export const LogoLink = styled(Link)`
  display: inline-block;
`;

export const Logo = styled.img`
  height: 72px;
  width: auto;
  /* brightness to adapt logo on dark bg */
  filter: brightness(0) invert(1);
  opacity: 0.92;
  display: block;
  /* opacity only — GPU composited */
  transition: opacity 0.2s ease;

  &:hover { opacity: 1; }

  @media (max-width: 768px) { height: 48px; }
`;

export const Tagline = styled.p`
  font-size: 12px;
  line-height: 1.7;
  color: ${dim};
  margin: 0;
  letter-spacing: 0.2px;

  @media (max-width: 768px) { display: none; }
`;

/* ── Nav columns ────────────────────────────── */
export const NavCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ColLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${accent};
  margin-bottom: 4px;
  display: block;
  font-family: 'DM Mono', monospace;
`;

export const NavLinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const NavLinkItem = styled.li``;

export const NavLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: ${dim};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* color only — fast */
  transition: color 0.18s ease;

  &::before {
    content: "";
    width: 0;
    height: 1px;
    background: ${accent};
    display: inline-block;
    transition: width 0.2s ease;
    flex-shrink: 0;
  }

  &:hover {
    color: #fff;

    &::before { width: 12px; }
  }
`;

/* ── Contact column ─────────────────────────── */
export const ContactCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 768px) { grid-column: 1 / -1; }
`;

export const ContactList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContactItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const ContactIcon = styled.img`
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  margin-top: 3px;
  filter: brightness(0) invert(1);
  opacity: 0.4;
`;

export const ContactText = styled.span`
  font-size: 13.5px;
  line-height: 1.65;
  color: ${dim};
`;

/* ── Bottom bar ─────────────────────────────── */
export const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const Copyright = styled.p`
  font-size: 12.5px;
  color: rgba(255,255,255,0.25);
  margin: 0;
  letter-spacing: 0.3px;
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const SocialIcon = styled.a`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${divider};
  display: flex;
  align-items: center;
  justify-content: center;
  /* opacity + border-color only */
  transition: opacity 0.2s ease, border-color 0.2s ease;
  opacity: 0.55;

  &:hover {
    opacity: 1;
    border-color: rgba(255,255,255,0.25);
  }

  img {
    width: 17px;
    height: 17px;
    object-fit: contain;
    /* static white filter on dark bg */
    filter: brightness(0) invert(1);
  }
`;

/* ── Keep old exports so existing index.tsx import doesn't break ── */
export const FooterContainer        = styled.div`display:none;`;
export const LogoSection2           = LogoSection;
export const NavSection             = styled.div``;
export const NavLinksWrapper        = styled.div``;
export const LinksColumn            = styled.div``;
export const LinksList              = NavLinkList;
export const LinkItem               = NavLinkItem;
export const DesktopSocialSection   = styled.div`display:none;`;
export const DesktopSocialIcon      = SocialIcon;
export const ContactSection         = styled.div`display:none;`;
export const MobileFooter           = styled.div`display:none;`;
export const MobileLogoSection      = styled.div`display:none;`;
export const MobileLogo             = styled.img``;
export const MobileNavSection       = styled.div`display:none;`;
export const MobileLinksColumn      = styled.div``;
export const MobileLinksList        = styled.ul``;
export const MobileLinkItem         = styled.li``;
export const MobileNavLink          = NavLink;
export const MobileContactSection   = styled.div`display:none;`;
export const MobileContactList      = styled.ul``;
export const MobileContactItem      = styled.li``;
export const MobileContactIcon      = ContactIcon;
export const MobileContactText      = ContactText;
export const MobileFooterBottom     = styled.div`display:none;`;
export const MobileSocialSection    = styled.div``;
export const MobileSocialIcon       = SocialIcon;
export const MobileCopyright        = styled.p``;