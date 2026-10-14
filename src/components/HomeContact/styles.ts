import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";
import { Eyebrow, stackedMedia, mobileMedia } from "../../styles/section";

const { colors, fonts } = theme;

// ISTT blue band that closes the page above the navy footer
export const ContactSection = styled.section`
  padding: 88px 0;
  background: ${colors.primary};
  color: ${colors.white};

  /* the light-blue label is too faint on this blue for small text */
  ${Eyebrow} { color: ${colors.white}; }

  ${stackedMedia} { padding: 72px 0; }
  ${mobileMedia} { padding: 56px 0; }
`;

export const Layout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;

  ${mobileMedia} {
    flex-direction: column;
    align-items: stretch;
    gap: 28px;
  }
`;

export const ContactButton = styled(Link)`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 32px;
  border: 1px solid ${colors.white};
  border-radius: 2px;
  background: ${colors.white};
  color: ${colors.navy};
  font-family: ${fonts.display};
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;

  span {
    display: inline-block;
    color: inherit;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: transparent;
    color: ${colors.white};
  }

  &:hover span { transform: translateX(3px); }

  ${mobileMedia} { min-height: 52px; }
`;
