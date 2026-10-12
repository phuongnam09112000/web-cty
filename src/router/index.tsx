import { lazy, Suspense, useEffect, MouseEvent } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../components/Footer";
import Header from "../components/Header";
import routes from "./config";
import { Styles } from "../styles/styles";

// Skip link lives in its own component so that language changes re-render
// only this link, not Router (Router creates its lazy route components
// inline, so re-rendering it would remount the current page).
const SkipLink = () => {
  const { t } = useTranslation();

  // Move keyboard focus to the main content without changing the URL
  const skipToContent = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("main-content")?.focus();
  };

  return (
    <a href="#main-content" className="skip-link" onClick={skipToContent}>
      {t("a11y.skip_to_content")}
    </a>
  );
};

const Router = () => {
  const location = useLocation(); // Lấy thông tin location hiện tại

  // Cuộn lên đầu trang khi location thay đổi (chuyển trang)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Tạo hiệu ứng cuộn mượt mà
    });
  }, [location.pathname]); // Chạy lại mỗi khi đường dẫn thay đổi

  return (
    <Suspense fallback={null}>
      <Styles />
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Switch>
          {routes.map((routeItem) => {
            return (
              <Route
                key={routeItem.component}
                path={routeItem.path}
                exact={routeItem.exact}
                component={lazy(() => import(`../pages/${routeItem.component}`))}
              />
            );
          })}
        </Switch>
      </main>
      <Footer />
    </Suspense>
  );
};

export default Router;