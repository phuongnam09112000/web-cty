/* Shared typography roles. Each role sets family, size, weight, line height
 * and letter spacing, with its tablet and mobile sizes built in, so a styled
 * component only says which role it is:  `${type.h2}`.
 * `typeImportant` is the same with !important, for the few components that
 * must override antd Typography's own heading rules. */
import { css } from "styled-components";
import { theme, TypeRole } from "./theme";

const { typeScale, fonts, breakpoints } = theme;

const tablet = `@media (max-width: ${breakpoints.lg}px)`;
const mobile = `@media (max-width: ${breakpoints.md}px)`;
const phone = `@media (max-width: ${breakpoints.xs}px)`;

const build = (role: TypeRole, important: boolean) => {
  const t = typeScale[role];
  const xs = "xs" in t ? (t as { xs: string }).xs : undefined;
  const imp = important ? " !important" : "";
  return css`
    font-family: ${fonts.body}${imp};
    font-size: ${t.desktop}${imp};
    font-weight: ${t.weight}${imp};
    line-height: ${t.lineHeight}${imp};
    letter-spacing: ${t.tracking}${imp};
    ${role === "label" ? "text-transform: uppercase;" : ""}

    ${t.tablet !== t.desktop ? css`${tablet} { font-size: ${t.tablet}${imp}; }` : ""}
    ${t.mobile !== t.tablet ? css`${mobile} { font-size: ${t.mobile}${imp}; }` : ""}
    ${xs ? css`${phone} { font-size: ${xs}${imp}; }` : ""}
  `;
};

const roles = Object.keys(typeScale) as TypeRole[];

export const type = Object.fromEntries(roles.map((r) => [r, build(r, false)])) as Record<TypeRole, ReturnType<typeof build>>;
export const typeImportant = Object.fromEntries(roles.map((r) => [r, build(r, true)])) as Record<TypeRole, ReturnType<typeof build>>;
