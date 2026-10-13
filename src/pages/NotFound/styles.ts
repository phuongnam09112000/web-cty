import styled from "styled-components";
import { Link } from "react-router-dom";

export const Section = styled.section`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: ${({ theme }) => theme.colors.surfaceSubtle};

  ${({ theme }) => theme.media.down("md")} {
    padding: 64px 16px;
  }
`;

export const Inner = styled.div`
  max-width: 560px;
  text-align: center;
`;

export const Eyebrow = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};

  &::before,
  &::after {
    content: '';
    width: 28px;
    height: 1px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const Heading = styled.h1`
  margin: 0 0 16px;
`;

export const Text = styled.p`
  margin: 0 0 32px;
  color: ${({ theme }) => theme.colors.textBody};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

export const ActionLink = styled(Link)<{ $variant?: "primary" | "secondary" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 28px;
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  ${({ $variant, theme }) =>
    $variant === "secondary"
      ? `background: transparent; color: ${theme.colors.primary};`
      : `background: ${theme.colors.primary}; color: ${theme.colors.white};`}

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    border-color: ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.white};
  }
`;
