const { createProxyMiddleware } = require("http-proxy-middleware");

const API_TARGET = process.env.CMS_API_TARGET || "http://127.0.0.1:4000";

module.exports = function setupProxy(app) {
  app.use(createProxyMiddleware("/api", { target: API_TARGET, changeOrigin: false }));
  app.use(createProxyMiddleware("/media", { target: API_TARGET, changeOrigin: false }));
};
