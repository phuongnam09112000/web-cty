import styled from "styled-components";
import { theme } from "../../styles/theme";
import { sectionPadding, stackedMedia, mobileMedia } from "../../styles/section";

const { colors, fonts, typeScale } = theme;

/* ─── Section ────────────────────────────────────────────────────────────── */
// White surface directly after the dark hero
export const AboutSection = styled.section`
  ${sectionPadding}
  background: ${colors.surface};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 72px;
  align-items: center;

  ${stackedMedia} {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
  }
`;

/* ─── Photograph ─────────────────────────────────────────────────────────── */
export const Figure = styled.figure`
  position: relative;
  margin: 0;
  /* room for the badge that overhangs the photo */
  padding: 0 32px 32px 0;

  ${mobileMedia} { padding: 0 16px 24px 0; }
`;

export const Photo = styled.div`
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: ${colors.surfaceMuted};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// "Founded 2001" plate in the photo's lower-right corner
export const Badge = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  min-width: 168px;
  padding: 24px 28px;
  background: ${colors.navyDeep};
  color: ${colors.white};

  span {
    display: block;
    margin-bottom: 6px;
    font-family: ${fonts.display};
    font-size: ${typeScale.label.size};
    font-weight: ${typeScale.label.weight};
    letter-spacing: ${typeScale.label.tracking};
    text-transform: uppercase;
    color: ${colors.secondaryLight};
  }

  strong {
    display: block;
    font-family: ${fonts.display};
    font-size: 40px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: ${colors.white};
  }

  ${mobileMedia} {
    min-width: 0;
    padding: 16px 20px;

    strong { font-size: 30px; }
  }
`;

/* ─── Text ───────────────────────────────────────────────────────────────── */
export const Content = styled.div`
  min-width: 0;
`;

export const Lead = styled.p`
  margin: 28px 0 0;
  font-family: ${fonts.display};
  font-size: ${typeScale.lead.tablet};
  line-height: 1.7;
  letter-spacing: 0;
  color: ${colors.textBody};

  ${mobileMedia} { font-size: ${typeScale.lead.mobile}; }
`;

export const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin: 36px 0 28px;
  padding: 28px 0 0;
  border-top: 1px solid ${colors.border};
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column-reverse; /* number above its label, label read first */

  dt {
    margin-top: 8px;
    font-family: ${fonts.display};
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    color: ${colors.textMuted};
  }

  dd {
    margin: 0;
    font-family: ${fonts.display};
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: ${colors.primary};

    ${mobileMedia} { font-size: 40px; }
  }
`;
