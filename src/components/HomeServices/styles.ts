import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import { sectionPadding, stackedMedia, mobileMedia } from "../../styles/section";

import { type } from "../../styles/typography";
const { colors, fonts, typeScale } = theme;
const rule = "rgba(255, 255, 255, 0.14)";

/* ─── Section ────────────────────────────────────────────────────────────── */
// Deep navy band between the light business areas and the white values
export const ServicesSection = styled.section`
  ${sectionPadding}
  background: ${colors.navyDeep};
  color: ${colors.white};
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 56px;

  ${mobileMedia} {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 36px;
  }
`;

/* ─── Three services as columns divided by hairlines ─────────────────────── */
export const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 64px;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid ${rule};

  li { position: relative; }

  /* divider centred in each column gap, so all three columns are equal */
  li + li::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: -32px;
    border-left: 1px solid ${rule};
  }

  ${stackedMedia} {
    grid-template-columns: minmax(0, 1fr);

    li + li { border-top: 1px solid ${rule}; }
    li + li::before { display: none; }
  }
`;

// The whole column is the link
export const ServiceLink = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 36px 0 40px;
  color: inherit;
  text-decoration: none;

  &:hover { color: inherit; }

  ${stackedMedia} {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: 32px;
    align-items: start;
    padding: 32px 0;
  }

  ${mobileMedia} {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    padding: 28px 0;
  }
`;

export const Photo = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  margin-bottom: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  ${ServiceLink}:hover & img { transform: scale(1.03); }

  ${stackedMedia} { margin-bottom: 0; }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Index = styled.span`
  display: block;
  margin-bottom: 12px;
  font-family: ${fonts.display};
  font-size: ${typeScale.label.size};
  font-weight: ${typeScale.label.weight};
  letter-spacing: ${typeScale.label.tracking};
  line-height: 1;
  color: ${colors.secondaryLight};
  font-variant-numeric: tabular-nums;
`;

export const Title = styled.h3`
  ${type.h3}
  margin: 0 0 14px;
  color: ${colors.white};

`;

export const Description = styled.p`
  ${type.body}
  flex: 1;
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.78);
`;

export const Cta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: ${fonts.display};
  font-size: 15px;
  font-weight: 600;
  color: ${colors.white};

  span {
    display: inline-block;
    color: inherit;
    transition: transform 0.2s ease;
  }

  ${ServiceLink}:hover &,
  ${ServiceLink}:focus-visible & {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  ${ServiceLink}:hover & span,
  ${ServiceLink}:focus-visible & span { transform: translateX(4px); }
`;
