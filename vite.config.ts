import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const backendTarget = process.env.VITE_BACKEND_TARGET ?? "http://localhost:8001";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/uploads": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
