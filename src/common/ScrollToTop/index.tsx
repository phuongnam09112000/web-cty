import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "../SvgIcon";
import { ScrollUpContainer } from "./styles";

// The page scrolls inside <body> (global overflow styles), so window.scrollY
// stays 0; read whichever element actually scrolls.
const getScrollTop = () =>
  Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);

const ScrollToTop = () => {
  const { t } = useTranslation();
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = useCallback(() => {
    if (getScrollTop() > 350) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  }, []);

  useEffect(() => {
    // capture: scroll events from <body> do not bubble to window
    document.addEventListener("scroll", checkScrollTop, { passive: true, capture: true });
    return () => {
      document.removeEventListener("scroll", checkScrollTop, { capture: true } as EventListenerOptions);
    };
  }, [checkScrollTop]);

  const scrollUp = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const options: ScrollToOptions = { top: 0, behavior: reduce ? "auto" : "smooth" };
    window.scrollTo(options);
    document.body.scrollTo(options);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollUp();
    }
  };

  return (
    <ScrollUpContainer
      role="button"
      tabIndex={showScroll ? 0 : -1}
      aria-label={t("a11y.scroll_to_top")}
      onClick={scrollUp}
      onKeyDown={onKeyDown}
      show={showScroll}
    >
      <SvgIcon src="scroll-top.svg" width="20px" height="20px" />
    </ScrollUpContainer>
  );
};

export default ScrollToTop;
