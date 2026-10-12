import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DownOutlined,
  GlobalOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import {
  AnimatedDropdownWrapper,
  breakpoints,
  ContentSpacer,
  FlagIcon,
  GlobalStyle,
  HeaderContainer,
  LanguageMenu,
  LanguageSelector,
  Logo,
  MobileLanguageHeader,
  MobileLanguageOption,
  MobileLanguageOptions,
  MobileLanguageSelector,
  MobileNavContainer,
  MobileNavDropdown,
  MobileNavHeader,
  MobileNavItem,
  MobileNavItems,
  MobileNavLink,
  MobileNavOverlay,
  MobileNavToggle,
  MobileSubMenu,
  MobileSubMenuItem,
  NavContainer,
  NavDropdown,
  NavItemLink,
  ServiceSubmenu,
} from "./styles";

type NavItemType = {
  key: string;
  path: string;
  labelKey: string;
  hasSubmenu?: boolean;
  submenuItems?: { key: string; labelKey: string; path: string }[];
};

type LanguageItemType = {
  key: string;
  label: string;
  flag: string;
};

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navItemsRef = useRef<HTMLDivElement[]>([]);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // ── Scroll listener for header shadow elevation ──────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── GSAP entrance animation ──────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        logoRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.35 }
      );
      gsap.fromTo(
        navItemsRef.current,
        { y: -12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.07,
          delay: 0.45,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // ── Resize handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > parseInt(breakpoints.tablet)) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Close dropdowns on route change ─────────────────────────────────────
  useEffect(() => {
    setOpenDropdowns([]);
  }, [location.pathname]);

  // ── Close mobile nav on outside click ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        mobileNavOpen &&
        !target.closest(".mobile-nav") &&
        !target.closest(".mobile-toggle")
      ) {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileNavOpen]);

  // ── Body scroll lock when mobile nav open ───────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const navItems: NavItemType[] = [
    { key: "home", path: "/", labelKey: "HOME" },
    { key: "about", path: "/about", labelKey: "ABOUT US" },
    { key: "services", path: "/services", labelKey: "OUR SERVICES" },
    {
      key: "solutions",
      path: "",
      labelKey: "OUR SOLUTIONS",
      hasSubmenu: true,
      submenuItems: [
        {
          key: "information-communication-technology",
          labelKey: "INFORMATION COMMUNICATION TECHNOLOGY",
          path: "/information-communication-technology",
        },
        {
          key: "secure-defense",
          labelKey: "SECURE & DEFENSE",
          path: "/secure-defense",
        },
        {
          key: "digital-transformation",
          labelKey: "DIGITAL TRANSFORMATION",
          path: "/digital-transformation",
        },
      ],
    },
    { key: "contact", path: "/contact", labelKey: "CONTACT" },
  ];

  const languageOptions: LanguageItemType[] = [
    { key: "en", label: "English", flag: "/img/icons/flag_en.svg" },
    { key: "vi", label: "Vietnamese", flag: "/img/icons/flag_vn.svg" },
  ];

  const isActiveRoute = (item: NavItemType): boolean => {
    if (location.pathname === item.path) return true;
    if (item.submenuItems) {
      return item.submenuItems.some((s) => location.pathname === s.path);
    }
    return false;
  };

  const handleMouseEnter = (key: string) => setHoveredItem(key);
  const handleMouseLeave = () => setHoveredItem(null);

  const handleDropdownVisibleChange = (visible: boolean, key: string) => {
    setOpenDropdowns((prev) =>
      visible ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const isDropdownOpen = (key: string) => openDropdowns.includes(key);

  const changeLanguage = (langKey: string) => {
    i18n.changeLanguage(langKey);
    if (mobileNavOpen) setMobileNavOpen(false);
  };

  const toggleMobileSubmenu = (key: string) => {
    setOpenMobileSubmenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const currentLangOption =
    languageOptions.find((l) => l.key === i18n.language) || languageOptions[0];

  const servicesMenu = (
    <ServiceSubmenu
      items={navItems
        .find((item) => item.key === "solutions")
        ?.submenuItems?.map((submenu) => ({
          key: submenu.key,
          label: <Link to={submenu.path}>{t(submenu.labelKey)}</Link>,
          type: "item" as const,
        }))}
    />
  );

  const languageMenu = (
    <LanguageMenu
      items={languageOptions.map((lang) => ({
        key: lang.key,
        label: (
          <div
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => changeLanguage(lang.key)}
          >
            <FlagIcon
              style={{ backgroundImage: `url(${lang.flag})` }}
            />
            {t(lang.label)}
          </div>
        ),
        type: "item" as const,
      }))}
    />
  );

  return (
    <>
      <GlobalStyle />
      <HeaderContainer ref={headerRef} $scrolled={scrolled}>
        {/* Logo */}
        <Logo to="/" ref={logoRef}>
          <img src="/img/icons/logo.png" alt="Logo" />
        </Logo>

        {/* Desktop Nav */}
        <NavContainer>
          {navItems.map((item, i) => {
            const isActive = isActiveRoute(item);
            const isHov = hoveredItem === item.key;
            const isAnyHov = hoveredItem !== null;
            const isOpen = isDropdownOpen(item.key);

            if (item.hasSubmenu) {
              return (
                <AnimatedDropdownWrapper key={item.key}>
                  <Dropdown
                    overlay={servicesMenu}
                    trigger={["hover"]}
                    mouseEnterDelay={0.15}
                    mouseLeaveDelay={0.25}
                    onVisibleChange={(v) =>
                      handleDropdownVisibleChange(v, item.key)
                    }
                  >
                    <NavDropdown
                      ref={(el) => { if (el) navItemsRef.current[i] = el as any; }}
                      $active={isActive}
                      $isHovered={isHov}
                      $isAnyHovered={isAnyHov}
                      $isDropdownOpen={isOpen}
                      onMouseEnter={() => handleMouseEnter(item.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {t(item.labelKey)}
                      <DownOutlined className="arrow-icon" />
                    </NavDropdown>
                  </Dropdown>
                </AnimatedDropdownWrapper>
              );
            }

            return (
              <NavItemLink
                key={item.key}
                to={item.path}
                ref={(el) => { if (el) navItemsRef.current[i] = el as any; }}
                $active={isActive}
                $isHovered={isHov}
                $isAnyHovered={isAnyHov}
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                {t(item.labelKey)}
              </NavItemLink>
            );
          })}

          {/* Language */}
          <AnimatedDropdownWrapper>
            <Dropdown
              overlay={languageMenu}
              trigger={["hover"]}
              mouseEnterDelay={0.15}
              mouseLeaveDelay={0.25}
              onVisibleChange={(v) =>
                handleDropdownVisibleChange(v, "language")
              }
            >
              <LanguageSelector
                $isHovered={hoveredItem === "language"}
                $isAnyHovered={hoveredItem !== null}
                $isDropdownOpen={isDropdownOpen("language")}
                onMouseEnter={() => handleMouseEnter("language")}
                onMouseLeave={handleMouseLeave}
              >
                <FlagIcon
                  style={{
                    backgroundImage: `url(${currentLangOption.flag})`,
                  }}
                />
                <span>{currentLangOption.key.toUpperCase()}</span>
                <DownOutlined style={{ fontSize: 9, opacity: 0.6 }} />
              </LanguageSelector>
            </Dropdown>
          </AnimatedDropdownWrapper>
        </NavContainer>

        {/* Mobile Toggle */}
        <MobileNavToggle
          className="mobile-toggle"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <CloseOutlined /> : <MenuOutlined />}
        </MobileNavToggle>

        {/* Mobile Overlay */}
        <MobileNavOverlay
          $isOpen={mobileNavOpen}
          onClick={() => setMobileNavOpen(false)}
        />

        {/* Mobile Panel */}
        <MobileNavContainer
          $isOpen={mobileNavOpen}
          className="mobile-nav"
          ref={mobileNavRef}
        >
          <MobileNavHeader>
            <Logo to="/" onClick={() => setMobileNavOpen(false)}>
              <img src="/img/icons/logo.png" alt="Logo" />
            </Logo>
            <CloseOutlined
              onClick={() => setMobileNavOpen(false)}
              style={{ fontSize: 18, cursor: "pointer", color: "#666" }}
            />
          </MobileNavHeader>

          <MobileNavItems>
            {navItems.map((item) => (
              <MobileNavItem key={item.key}>
                {item.hasSubmenu ? (
                  <>
                    <MobileNavDropdown
                      onClick={() => toggleMobileSubmenu(item.key)}
                      style={{
                        color: isActiveRoute(item)
                          ? "rgb(13, 58, 115)"
                          : undefined,
                      }}
                    >
                      {t(item.labelKey)}
                      <DownOutlined
                        style={{
                          fontSize: 10,
                          transition: "transform 0.25s ease",
                          transform: openMobileSubmenus.includes(item.key)
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </MobileNavDropdown>
                    <MobileSubMenu
                      $isOpen={openMobileSubmenus.includes(item.key)}
                    >
                      {item.submenuItems?.map((sub) => (
                        <MobileSubMenuItem
                          key={sub.key}
                          to={sub.path}
                          onClick={() => setMobileNavOpen(false)}
                          style={{
                            color:
                              location.pathname === sub.path
                                ? "rgb(13, 58, 115)"
                                : undefined,
                          }}
                        >
                          {t(sub.labelKey)}
                        </MobileSubMenuItem>
                      ))}
                    </MobileSubMenu>
                  </>
                ) : (
                  <MobileNavLink
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color:
                        location.pathname === item.path
                          ? "rgb(13, 58, 115)"
                          : undefined,
                    }}
                  >
                    {t(item.labelKey)}
                  </MobileNavLink>
                )}
              </MobileNavItem>
            ))}
          </MobileNavItems>

          {/* Mobile Language */}
          <MobileLanguageSelector>
            <MobileLanguageHeader>
              <GlobalOutlined />
              {t("Language")}
            </MobileLanguageHeader>
            <MobileLanguageOptions>
              {languageOptions.map((lang) => (
                <MobileLanguageOption
                  key={lang.key}
                  $active={i18n.language === lang.key}
                  onClick={() => changeLanguage(lang.key)}
                >
                  <FlagIcon
                    style={{ backgroundImage: `url(${lang.flag})` }}
                  />
                  {t(lang.label)}
                </MobileLanguageOption>
              ))}
            </MobileLanguageOptions>
          </MobileLanguageSelector>
        </MobileNavContainer>
      </HeaderContainer>
      <ContentSpacer />
    </>
  );
};

export default Header;