import { Button, Input, Modal } from "antd";
import { MapContainer } from "react-leaflet";
import styled from "styled-components";

// Styled Components
export const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 650px;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    height: 500px;
  }
  
  @media (max-width: 768px) {
    height: 450px;
  }
  
  @media (max-width: 480px) {
    height: 400px;
  }
`;

export const BannerImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
`;

export const MapOverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  z-index: 5;
`;

export const MapIframeStyled = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export const ButtonContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 70px;
  display: flex;
  gap: 12px;
  z-index: 20;
  
  @media (max-width: 1024px) {
    right: 50px;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    right: 0;
    left: 0;
    bottom: 20px;
    justify-content: center;
    padding: 0 15px;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    bottom: 15px;
    gap: 10px;
  }
`;

export const LocationButton = styled(Button)<{ isActive: boolean }>`
  font-weight: bold;
  font-size: 16px;
  padding: 0 24px;
  height: 42px;
  border-radius: 6px;
  transition: all 0.3s;
  width: 240px;
  text-align: left;
  
  background-color: ${props => props.isActive ? '#084B7A' : 'white'};
  color: ${props => props.isActive ? 'white' : '#084B7A'};
  border-color: ${props => props.isActive ? '#084B7A' : '#d9d9d9'};
  
  &:hover, &:focus {
    background-color: ${props => props.isActive ? '#0A5E96' : '#E6F0F7'};
    color: ${props => props.isActive ? 'white' : '#084B7A'};
    border-color: ${props => props.isActive ? '#0A5E96' : '#084B7A'};
  }
  
  @media (max-width: 1024px) {
    width: 220px;
    font-size: 15px;
    padding: 0 20px;
  }
  
  @media (max-width: 768px) {
    width: 200px;
    font-size: 14px;
    padding: 0 16px;
    height: 38px;
  }
  
  @media (max-width: 576px) {
    width: 150px;
    font-size: 13px;
    padding: 0 12px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;