import styled, { keyframes, css } from "styled-components";
import { Form, Input, Button } from "antd";

/* ─── Tokens ─────────────────────────────────── */
const blue      = "#0e5d95";
const blueDeep  = "#0d1b2a";
const blueAccent= "#4da3e0";

/* ─── Keyframes ─────────────────────────────── */
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

/* ─── Page wrapper ───────────────────────────── */
export const ContactContainer = styled.section`
  width: 100%;
  background: #f5f8fb;
  position: relative;
  overflow: hidden;
  padding: 100px 40px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#d0dfe9 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.4;
    pointer-events: none;
  }

  @media (max-width: 768px) { padding: 72px 24px; }
  @media (max-width: 480px) { padding: 56px 16px; }
`;

export const InnerWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: flex;
  box-shadow:
    0 2px 8px rgba(14,93,149,0.06),
    0 24px 64px rgba(14,93,149,0.12);

  @media (max-width: 900px) { flex-direction: column; }
`;

/* ─── Left dark panel ────────────────────────── */
export const LeftPanel = styled.div`
  width: 380px;
  flex-shrink: 0;
  background: ${blueDeep};
  padding: 64px 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 4px;
    background: linear-gradient(90deg, ${blue}, ${blueAccent});
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14,93,149,0.22) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 1100px) { width: 320px; padding: 52px 36px; }
  @media (max-width: 900px)  { width: 100%; padding: 48px 36px; }
  @media (max-width: 480px)  { padding: 40px 24px; }
`;

export const PanelTop = styled.div`
  position: relative;
  z-index: 1;
`;

export const PanelEyebrow = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${blueAccent};
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  &::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: ${blueAccent};
    opacity: 0.6;
  }
`;

export const PanelTitle = styled.h2`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0 0 10px 0;

  em { font-style: italic; color: ${blueAccent}; }

  @media (max-width: 1100px) { font-size: 26px; }
  @media (max-width: 480px)  { font-size: 22px; }
`;

export const PanelDivider = styled.div`
  height: 3px;
  width: 48px;
  background: linear-gradient(90deg, ${blueAccent}, ${blue});
  background-size: 200% auto;
  margin: 16px 0 24px;
  animation: ${shimmer} 3s linear infinite;
`;

export const PanelDesc = styled.p`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.85;
  color: rgba(255,255,255,0.48);
  margin: 0;
`;

export const PanelBottom = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 56px;

  @media (max-width: 900px) { margin-top: 40px; }
`;

export const ContactInfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: transform 0.25s ease;

  &:hover { transform: translateX(4px); }
`;

export const ContactInfoIcon = styled.div`
  width: 36px; height: 36px;
  border-radius: 8px;
  background: rgba(14,93,149,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${blueAccent};
  transition: background 0.25s ease;

  ${ContactInfoItem}:hover & { background: rgba(14,93,149,0.4); }

  svg { width: 15px; height: 15px; }
`;

export const ContactInfoTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ContactInfoLabel = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
`;

export const ContactInfoValue = styled.span`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(255,255,255,0.62);
`;

/* ─── Right form panel ───────────────────────── */
export const RightPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 64px 56px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -14px; right: -14px;
    width: 48px; height: 48px;
    border-right: 2px solid #c8dce9;
    border-bottom: 2px solid #c8dce9;
    pointer-events: none;
  }

  @media (max-width: 1100px) { padding: 52px 40px; }
  @media (max-width: 900px)  { padding: 48px 36px; }
  @media (max-width: 480px)  { padding: 36px 24px; }
`;

export const FormEyebrow = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${blue};
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  &::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: ${blue};
  }
`;

export const FormHeading = styled.h3`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: ${blueDeep};
  margin: 0 0 8px 0;

  em { font-style: italic; color: ${blue}; }

  @media (max-width: 480px) { font-size: 22px; }
`;

export const FormDivider = styled.div`
  height: 3px;
  width: 44px;
  background: linear-gradient(90deg, ${blue}, ${blueAccent}, ${blue});
  background-size: 200% auto;
  border-radius: 2px;
  margin-bottom: 36px;
  animation: ${shimmer} 3s linear infinite;
`;

/* ─── Ant Design ─────────────────────────────── */
export const StyledForm = styled(Form)`
  .ant-form-item { margin-bottom: 0; }
  .ant-form-item-explain-error {
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 12px;
    margin-top: 4px;
  }
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

export const FullRow = styled.div`
  margin-bottom: 16px;
`;

export const StyledFormItem   = styled(Form.Item)`margin-bottom: 0 !important;`;
export const ContentFormItem  = styled(Form.Item)`margin-bottom: 0 !important;`;

const fieldBase = css`
  width: 100%;
  border: 1px solid #d8e8f2 !important;
  border-radius: 0 !important;
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  letter-spacing: 0.01em !important;
  color: ${blueDeep} !important;
  background: #f5f9fc !important;
  box-shadow: none !important;
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease !important;

  &::placeholder { color: #9ab0c2 !important; font-style: italic; }

  &:hover { border-color: #94b8d4 !important; background: #fff !important; }

  &:focus, &.ant-input-focused {
    border-color: ${blue} !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(14,93,149,0.08) !important;
  }
`;

export const StyledInput = styled(Input)`
  ${fieldBase}
  height: 46px !important;
  padding: 0 14px !important;
`;

export const ContactFormTextArea = styled(Input.TextArea)`
  ${fieldBase}
  padding: 12px 14px !important;
  resize: vertical !important;
  min-height: 120px !important;
`;

/* ─── Submit ─────────────────────────────────── */
export const SubmitButtonContainer = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 480px) { justify-content: stretch; }
`;

export const SubmitButton = styled(Button)`
  height: 48px !important;
  padding: 0 40px !important;
  border-radius: 0 !important;
  font-family: 'JetBrains Mono', 'Courier New', monospace !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  background: ${blueDeep} !important;
  border-color: ${blueDeep} !important;
  color: #fff !important;
  position: relative !important;
  overflow: hidden !important;

  &::before {
    content: '' !important;
    position: absolute !important;
    inset: 0 !important;
    background: ${blue} !important;
    transform: scaleX(0) !important;
    transform-origin: left !important;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1) !important;
    z-index: 0 !important;
  }

  span { position: relative !important; z-index: 1 !important; }

  &:hover:not([disabled]) {
    border-color: ${blue} !important;
    &::before { transform: scaleX(1) !important; }
  }

  @media (max-width: 480px) { width: 100% !important; }
`;

/* ─── Modal ──────────────────────────────────── */
export const ModalContainer = styled.div`
  padding: 56px 48px;
  text-align: center;
  background: #fff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 4px;
    background: linear-gradient(90deg, ${blue}, ${blueAccent});
  }
`;

export const ThankYouTitle = styled.h3`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${blueDeep};
  margin: 0 0 12px 0;

  em { font-style: italic; color: ${blue}; }
`;

export const ThankYouText = styled.p`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: #5a7080;
  margin: 0;
`;

/* backward-compat */
export const LeftColumn  = styled.div``;
export const RightColumn = styled.div``;
export const Title     = PanelTitle;
export const FormTitle = FormHeading;