import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        headers: { "X-Admin-Gateway": process.env.ADMIN_GATEWAY_SECRET ?? "" },
      },
    },
  },
});
