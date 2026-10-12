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

// Class added to each desktop dropdown's overlay so it can be found in the DOM
const dropdownOverlayClass = (key: string) => `istt-dropdown-${key}`;

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
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  // Desktop dropdown trigger buttons, keyed by dropdown key
  const dropdownTriggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const prevOpenDropdownsRef = useRef<string[]>([]);
  // Set when a dropdown is dismissed by a click outside it, so focus is not
  // pulled back to its trigger after the user clicked somewhere else.
  const skipDropdownFocusReturnRef = useRef(false);

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

  // ── Mobile nav keyboard support ─────────────────────────────────────────
  // Escape closes the open mobile menu.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  // Whenever the mobile menu closes while focus is inside it (Escape, close
  // button, link, language choice, resize), return focus to the toggle so it
  // is never left on a hidden element.
  useEffect(() => {
    if (mobileNavOpen) return;
    const panel = mobileNavRef.current;
    const active = document.activeElement as HTMLElement | null;
    if (panel && active && panel.contains(active)) {
      mobileToggleRef.current?.focus();
      // toggle is display:none above the tablet breakpoint
      if (document.activeElement === active) active.blur();
    }
  }, [mobileNavOpen]);

  // Keyboard focus leaving the menu and its toggle closes the menu, so focus
  // cannot move to page content hidden behind the overlay.
  const handleMobileNavBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!mobileNavOpen || !next) return;
    if (
      mobileNavRef.current?.contains(next) ||
      mobileToggleRef.current?.contains(next)
    ) {
      return;
    }
    setMobileNavOpen(false);
  };

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
      visible
        ? prev.includes(key) ? prev : [...prev, key]
        : prev.filter((k) => k !== key)
    );
  };

  const isDropdownOpen = (key: string) => openDropdowns.includes(key);

  // ── Desktop dropdown keyboard support ───────────────────────────────────
  // Dropdowns are controlled by `openDropdowns`, which hover already updates
  // through onOpenChange, so mouse behaviour is unchanged. Escape and Tab
  // inside an open menu are handled by antd's rc-dropdown (Escape closes and
  // returns focus to the trigger button).
  const focusFirstMenuItem = (key: string) => {
    let tries = 0;
    const attempt = () => {
      const overlay = document.querySelector<HTMLElement>(
        `.${dropdownOverlayClass(key)}:not(.ant-dropdown-hidden)`
      );
      const target =
        overlay?.querySelector<HTMLElement>("a[href]") ||
        overlay?.querySelector<HTMLElement>('[role="menuitem"]');
      if (target && target.offsetParent !== null) {
        target.focus();
      } else if (++tries < 20) {
        requestAnimationFrame(attempt);
      }
    };
    requestAnimationFrame(attempt);
  };

  const onDropdownTriggerKeyDown =
    (key: string) => (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDropdownVisibleChange(!isDropdownOpen(key), key);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDropdownVisibleChange(true, key);
        focusFirstMenuItem(key);
      }
    };

  // When a dropdown closes while focus is inside it, return focus to its
  // trigger so focus is never left on a hidden menu item.
  useEffect(() => {
    const closed = prevOpenDropdownsRef.current.filter(
      (k) => !openDropdowns.includes(k)
    );
    prevOpenDropdownsRef.current = openDropdowns;
    if (skipDropdownFocusReturnRef.current) {
      skipDropdownFocusReturnRef.current = false;
      return;
    }
    closed.forEach((key) => {
      const overlay = document.querySelector(`.${dropdownOverlayClass(key)}`);
      if (overlay && overlay.contains(document.activeElement)) {
        dropdownTriggerRefs.current[key]?.focus();
      }
    });
  }, [openDropdowns]);

  // A mouse/touch press outside an open dropdown (its trigger and its menu)
  // closes it. Matters for keyboard-opened menus, which hover never closes.
  // Presses on the trigger or inside the menu are ignored, so hover and
  // menu-item clicks behave as before.
  useEffect(() => {
    if (openDropdowns.length === 0) return;
    const onPointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const toClose = openDropdowns.filter((key) => {
        const trigger = dropdownTriggerRefs.current[key];
        const overlay = document.querySelector(`.${dropdownOverlayClass(key)}`);
        return !trigger?.contains(target) && !overlay?.contains(target);
      });
      if (toClose.length === 0) return;
      skipDropdownFocusReturnRef.current = true;
      setOpenDropdowns((prev) => prev.filter((k) => !toClose.includes(k)));
    };
    document.addEventListener("mousedown", onPointerDownOutside);
    return () => document.removeEventListener("mousedown", onPointerDownOutside);
  }, [openDropdowns]);

  const changeLanguage = (langKey: string) => {
    i18n.changeLanguage(langKey);
    if (mobileNavOpen) setMobileNavOpen(false);
  };

  const toggleMobileSubmenu = (key: string) => {
    setOpenMobileSubmenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Keyboard activation (Enter / Space) for non-button controls; reuses the
  // same handlers as their onClick so behaviour is unchanged.
  const onKeyActivate =
    (action: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    };

  const currentLangOption =
    languageOptions.find((l) => l.key === i18n.language) || languageOptions[0];

  const servicesMenu = (
    <ServiceSubmenu
      tabIndex={-1}
      onClick={({ domEvent }) => {
        // mouse click or Enter on a link (which fires a click): close the menu
        if (domEvent.type === "click") handleDropdownVisibleChange(false, "solutions");
      }}
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
      onClick={({ key }) => {
        changeLanguage(key);
        handleDropdownVisibleChange(false, "language");
      }}
      items={languageOptions.map((lang) => ({
        key: lang.key,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          <img src="/img/icons/logo.png" alt="ISTT" />
        </Logo>

        {/* Desktop Nav */}
        <NavContainer aria-label={t("a11y.main_navigation")}>
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
                    open={isOpen}
                    onOpenChange={(v) =>
                      handleDropdownVisibleChange(v, item.key)
                    }
                    overlayClassName={dropdownOverlayClass(item.key)}
                  >
                    <NavDropdown
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      onKeyDown={onDropdownTriggerKeyDown(item.key)}
                      ref={(el) => {
                        if (el) navItemsRef.current[i] = el as any;
                        dropdownTriggerRefs.current[item.key] = el;
                      }}
                      $active={isActive}
                      $isHovered={isHov}
                      $isAnyHovered={isAnyHov}
                      $isDropdownOpen={isOpen}
                      onMouseEnter={() => handleMouseEnter(item.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {t(item.labelKey)}
                      <DownOutlined className="arrow-icon" aria-hidden="true" />
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
              open={isDropdownOpen("language")}
              onOpenChange={(v) =>
                handleDropdownVisibleChange(v, "language")
              }
              overlayClassName={dropdownOverlayClass("language")}
            >
              <LanguageSelector
                type="button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen("language")}
                aria-label={`${t("Language")}: ${currentLangOption.key.toUpperCase()}`}
                onKeyDown={onDropdownTriggerKeyDown("language")}
                ref={(el) => { dropdownTriggerRefs.current["language"] = el; }}
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
                <DownOutlined style={{ fontSize: 9, opacity: 0.6 }} aria-hidden="true" />
              </LanguageSelector>
            </Dropdown>
          </AnimatedDropdownWrapper>
        </NavContainer>

        {/* Mobile Toggle */}
        <MobileNavToggle
          ref={mobileToggleRef}
          type="button"
          className="mobile-toggle"
          aria-label={t("a11y.menu")}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          onBlur={handleMobileNavBlur}
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
          id="mobile-navigation"
          role="navigation"
          aria-label={t("a11y.main_navigation")}
          onBlur={handleMobileNavBlur}
          $isOpen={mobileNavOpen}
          className="mobile-nav"
          ref={mobileNavRef}
        >
          <MobileNavHeader>
            <Logo to="/" onClick={() => setMobileNavOpen(false)}>
              <img src="/img/icons/logo.png" alt="ISTT" />
            </Logo>
            <CloseOutlined
              role="button"
              tabIndex={0}
              aria-label={t("a11y.close_menu")}
              onClick={() => setMobileNavOpen(false)}
              onKeyDown={onKeyActivate(() => setMobileNavOpen(false))}
              style={{ fontSize: 18, cursor: "pointer", color: "#666" }}
            />
          </MobileNavHeader>

          <MobileNavItems>
            {navItems.map((item) => (
              <MobileNavItem key={item.key}>
                {item.hasSubmenu ? (
                  <>
                    <MobileNavDropdown
                      role="button"
                      tabIndex={0}
                      aria-expanded={openMobileSubmenus.includes(item.key)}
                      onClick={() => toggleMobileSubmenu(item.key)}
                      onKeyDown={onKeyActivate(() => toggleMobileSubmenu(item.key))}
                      style={{
                        color: isActiveRoute(item)
                          ? "rgb(13, 58, 115)"
                          : undefined,
                      }}
                    >
                      {t(item.labelKey)}
                      <DownOutlined
                        aria-hidden="true"
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
                  role="button"
                  tabIndex={0}
                  aria-pressed={i18n.language === lang.key}
                  $active={i18n.language === lang.key}
                  onClick={() => changeLanguage(lang.key)}
                  onKeyDown={onKeyActivate(() => changeLanguage(lang.key))}
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