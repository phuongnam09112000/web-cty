
import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BannerContainer, BannerImage, ButtonContainer, LocationButton, MapIframeStyled, MapOverlayContainer } from './styles';

// Constants - URLs Google Maps embed
const GOOGLE_MAPS_EMBED_URL_1 = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5885779171026!2d105.78849788860236!3d21.009122938534922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5612da8b23%3A0xd37b3360e78c5c1a!2sVimeco%20CT4%20Tower!5e0!3m2!1svi!2s!4v1745293152941!5m2!1svi!2s";
const GOOGLE_MAPS_EMBED_URL_2 = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d979.9278210074586!2d106.70557115618804!3d10.756720053765763!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f97b9555815%3A0xd42396a461ec1afe!2sTSA%20BUILDING!5e0!3m2!1svi!2s!4v1745293043415!5m2!1svi!2s";

const MapBanner = () => {
  const { t } = useTranslation();
  const [currentMapUrl, setCurrentMapUrl] = useState(GOOGLE_MAPS_EMBED_URL_1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport size on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Location data
  const locationData = {
    location1: {
      name: "Hanoi Office",
      address: "V2A & V3A, 2nd Floor, CT4-Vimeco Complex Building, H1 Lot, Yen Hoa Ward, Ha Noi City, Viet Nam",
      mapUrl: GOOGLE_MAPS_EMBED_URL_1
    },
    location2: {
      name: "Ho Chi Minh City Office",
      address: "4th Floor, TSA Building, 258 Ton Dan Street, Khanh Hoi Ward, Ho Chi Minh City, Viet Nam",
      mapUrl: GOOGLE_MAPS_EMBED_URL_2
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const showLocation1 = () => {
    setCurrentMapUrl(GOOGLE_MAPS_EMBED_URL_1);
  };

  const showLocation2 = () => {
    setCurrentMapUrl(GOOGLE_MAPS_EMBED_URL_2);
  };

  return (
    <>
      <BannerContainer>
        <BannerImage />
        
        <MapOverlayContainer>
          <MapIframeStyled 
            src={currentMapUrl}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </MapOverlayContainer>
        
        {/* <OverlayContainer>
          <TitleOverlay>{t("Văn phòng của chúng tôi")}</TitleOverlay>
        </OverlayContainer> */}
        
        <ButtonContainer>
          <LocationButton 
            $isActive={currentMapUrl === GOOGLE_MAPS_EMBED_URL_1}
            onClick={showLocation1}
            icon={<EnvironmentOutlined />}
          >
            {isMobile ? t("Hanoi") : t(locationData.location1.name)}
          </LocationButton>
          
          <LocationButton 
            $isActive={currentMapUrl === GOOGLE_MAPS_EMBED_URL_2}
            onClick={showLocation2}
            icon={<EnvironmentOutlined />}
          >
            {isMobile ? t("Ho Chi Minh City") : t(locationData.location2.name)}
          </LocationButton>
        </ButtonContainer>
      </BannerContainer>

      {/* Thank You Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        width={isMobile ? '90%' : 600}
        bodyStyle={{
          textAlign: "center",
          padding: isMobile ? "15px" : "20px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ 
          color: "#0E5D95", 
          fontSize: isMobile ? "20px" : "24px", 
          fontWeight: "bold" 
        }}>
          {t("Cảm ơn")}
        </h2>
        <p style={{
          fontSize: isMobile ? "16px" : "20px"
        }}>
          {t("Cảm ơn bạn đã liên hệ! Đội ngũ của chúng tôi sẽ phản hồi sớm nhất có thể.")}
        </p>
      </Modal>
    </>
  );
};

export default MapBanner;