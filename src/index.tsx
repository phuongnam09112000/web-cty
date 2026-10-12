import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "styled-components";
import "antd/dist/antd.css";

import Router from "./router";
import i18n from "./translation";
import theme from "./styles/theme";
import { initFocusSourceTracking } from "./common/utils/focusSource";

initFocusSourceTracking();

const App = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById("root"));
