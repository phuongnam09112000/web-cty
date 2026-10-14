import styled from "styled-components";
import { theme } from "../../styles/theme";
import { sectionPadding, stackedMedia, mobileMedia } from "../../styles/section";

const { colors, fonts } = theme;

export const Intro = styled.p<{ $center?: boolean }>`
  margin: 20px 0 0;
  max-width: ${p => (p.$center ? "560px" : "none")};
  margin-left: ${p => (p.$center ? "auto" : "0")};
  margin-right: ${p => (p.$center ? "auto" : "0")};
  font-family: ${fonts.display};
  font-size: 17px;
  line-height: 1.7;
  letter-spacing: 0;
  color: ${colors.textBody};

  ${mobileMedia} { font-size: 16px; }
`;

/* ─── Partners: heading column beside a compact, expandable logo grid ───── */
export const PartnersSection = styled.section`
  ${sectionPadding}
  background: ${colors.surface};
`;

export const PartnersLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  gap: 72px;
  align-items: start;

  ${stackedMedia} {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
`;

export const PartnersAside = styled.div`
  ${stackedMedia} {
    /* on stacked layouts the toggle moves below the logos */
    & > button { display: none; }
  }
`;

export const LogoGrid = styled.ul`
  --logo-scale: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 24px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${stackedMedia} { --logo-scale: 0.95; }
  ${mobileMedia} {
    --logo-scale: 0.9;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 16px;
  }
`;

export const LogoCell = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 112px;

  &[hidden] { display: none; }

  ${mobileMedia} { height: 88px; }
`;

export const ToggleRow = styled.div`
  display: none;
  margin-top: 24px;
  text-align: center;

  ${stackedMedia} { display: block; }
`;

export const Toggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  margin-top: 36px;
  padding: 0 24px;
  border: 1px solid ${colors.primary};
  border-radius: 2px;
  background: transparent;
  color: ${colors.primary};
  font-family: ${fonts.display};
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${colors.primary};
    color: ${colors.white};
  }

  svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    transition: transform 0.2s ease;
  }

  &[aria-expanded="true"] svg { transform: rotate(180deg); }

  ${ToggleRow} & { margin-top: 0; }
`;

/* ─── Customers: centred heading over one balanced logo panel ────────────── */
export const CustomersSection = styled.section`
  ${sectionPadding}
  background: ${colors.surfaceSubtle};
  text-align: center;
`;

export const CustomersHeader = styled.div`
  max-width: 720px;
  margin: 0 auto 56px;

  /* centre the eyebrow's leading rule with its text */
  & > p:first-child { justify-content: center; }

  ${mobileMedia} { margin-bottom: 36px; }
`;

// Hairline dividers inside one white panel: the panel shows through 1px gaps
export const CustomerPanel = styled.ul`
  --logo-scale: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: ${colors.border};
  border: 1px solid ${colors.border};

  ${stackedMedia} { --logo-scale: 0.85; }
  ${mobileMedia} {
    --logo-scale: 0.9;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const CustomerCell = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* logos share one baseline across a row */
  gap: 16px;
  min-height: 176px;
  padding: 28px 16px 24px;
  background: ${colors.surface};

  ${stackedMedia} { min-height: 156px; padding: 24px 12px 20px; }
  ${mobileMedia} { min-height: 140px; gap: 12px; }
`;

export const CustomerLogo = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;

  ${mobileMedia} { height: 52px; }
`;

export const CustomerName = styled.span`
  font-family: ${fonts.display};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: ${colors.textMuted};
  text-wrap: balance;
  /* room for two lines, so a long name does not lift its logo */
  min-height: calc(2 * 1.4em);
`;
