import React from 'react';
import { useTranslation } from 'react-i18next';
import { BannerContainer, ContactText } from './styles';
import { ContactBanner as Contact } from './types';


const ContactBanner: React.FC<Contact> = ({
  backgroundColor,
  textColor,
  contactText = 'Please contact us for studying our outstanding customer case studies and further business discussion...',
  marginTop,
  marginBottom,
}) => {
  const { t } = useTranslation();
  
  return (
    <BannerContainer 
      backgroundColor={backgroundColor}
      marginTop={marginTop}
      marginBottom={marginBottom}
    >
      <ContactText textColor={textColor}>
        {t(contactText)}
      </ContactText>
    </BannerContainer>
  );
};

export default ContactBanner;