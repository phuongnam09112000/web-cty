import { useTranslation, withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import ContactLink from "../../common/ContactLink";
import {
  FooterSection,
  FooterTop,
  FooterBottom,
  Inner,
  TopGrid,
  LogoSection,
  LogoLink,
  Logo,
  Tagline,
  NavCol,
  ColLabel,
  NavLinkList,
  NavLinkItem,
  NavLink,
  ContactCol,
  ContactList,
  ContactItem,
  ContactIcon,
  ContactText,
  BottomBar,
  Copyright,
  SocialRow,
  SocialIcon,
} from "./styles";

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleClick = (path: string) => (e: React.MouseEvent) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop();
    }
  };

  const navPages = [
    { to: "/",                                    label: "HOME" },
    { to: "/about",                               label: "ABOUT US" },
  ];

  const navSolutions = [
    { to: "/information-communication-technology", label: "OUR SOLUTIONS" },
    { to: "/services",                             label: "OUR SERVICES" },
    { to: "/contact",                              label: "CONTACT" },
  ];

  const contacts = [
    { icon: "/img/icons/building.svg", text: "V2A & V3A, 2nd Floor, CT4-Vimeco Complex Building, H1 Lot, Yen Hoa Ward, Ha Noi City, Viet Nam" },
    { icon: "/img/icons/building.svg", text: "4th Floor, TSA Building, 258 Ton Dan Street, Khanh Hoi Ward, Ho Chi Minh City, Viet Nam" },
    { icon: "/img/icons/mail.svg",     text: "contact@istt.com.vn", link: "mailto" as const },
    { icon: "/img/icons/phone.svg",    text: "(+84) 24 3766 3766", link: "tel" as const },
  ];

  return (
    <FooterSection>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@700&display=swap');
      `}</style>

      <FooterTop>
        <Inner>
          <TopGrid>
            {/* Logo */}
            <LogoSection>
              <LogoLink to="/" onClick={handleClick("/")}>
                <Logo src="/img/icons/logo.png" alt="ISTT" />
              </LogoLink>
              <Tagline>
                Information Services &amp;<br />Technology Transfer
              </Tagline>
            </LogoSection>

            {/* Nav col 1 */}
            <NavCol>
              <ColLabel>{t("Company")}</ColLabel>
              <NavLinkList>
                {navPages.map(({ to, label }) => (
                  <NavLinkItem key={to}>
                    <NavLink to={to} onClick={handleClick(to)}>
                      {t(label)}
                    </NavLink>
                  </NavLinkItem>
                ))}
              </NavLinkList>
            </NavCol>

            {/* Nav col 2 */}
            <NavCol>
              <ColLabel>{t("Services")}</ColLabel>
              <NavLinkList>
                {navSolutions.map(({ to, label }) => (
                  <NavLinkItem key={to}>
                    <NavLink to={to} onClick={handleClick(to)}>
                      {t(label)}
                    </NavLink>
                  </NavLinkItem>
                ))}
              </NavLinkList>
            </NavCol>

            {/* Contact */}
            <ContactCol>
              <ColLabel>{t("Contact")}</ColLabel>
              <ContactList>
                {contacts.map(({ icon, text, link }, i) => (
                  <ContactItem key={i}>
                    <ContactIcon src={icon} alt="" />
                    <ContactText>{link ? <ContactLink type={link} value={t(text)} /> : t(text)}</ContactText>
                  </ContactItem>
                ))}
              </ContactList>
            </ContactCol>
          </TopGrid>
        </Inner>
      </FooterTop>

      <FooterBottom>
        <Inner>
          <BottomBar>
            <Copyright>© 2025 ISTT Co., Ltd. All rights reserved.</Copyright>
            <SocialRow>
              <SocialIcon
                href="https://wa.me/+84914477666"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                />
              </SocialIcon>
              <SocialIcon
                href="https://vn.linkedin.com/company/istt-co.-ltd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                  alt="LinkedIn"
                />
              </SocialIcon>
            </SocialRow>
          </BottomBar>
        </Inner>
      </FooterBottom>
    </FooterSection>
  );
};

export default withTranslation()(Footer);