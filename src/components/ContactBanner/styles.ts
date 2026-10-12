import styled from 'styled-components';
import { Typography } from 'antd';

const { Paragraph } = Typography;

export const BannerContainer = styled.div<{ 
  backgroundColor?: string;
  marginTop?: string;
  marginBottom?: string;
}>`
  width: 100%;
  max-width: 1440px;
  margin: ${props => props.marginTop || '40px'} auto ${props => props.marginBottom || '0'};
  padding: 24px 40px;
  background-color: ${props => props.backgroundColor || 'rgba(10, 94, 150, 0.05)'};
  border-radius: 12px;
  box-shadow: 0px 4px 16px rgba(91, 91, 91, 0.06);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-top: ${props => props.marginTop || '30px'};
    margin-bottom: ${props => props.marginBottom || '0'};
  }
`;

export const ContactText = styled(Paragraph)<{ textColor?: string }>`
  font-size: 18px !important;
  line-height: 28px !important;
  color: ${props => props.textColor || '#333'} !important;
  margin-bottom: 0 !important;
  font-weight: 500 !important;
  
  @media (max-width: 768px) {
    font-size: 16px !important;
    line-height: 24px !important;
  }
`;