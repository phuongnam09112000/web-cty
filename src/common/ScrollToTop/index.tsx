import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "../SvgIcon";
import { ScrollUpContainer } from "./styles";

const ScrollToTop = () => {
  const { t } = useTranslation();
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = useCallback(() => {
    if (window.scrollY > 350) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [checkScrollTop]);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
