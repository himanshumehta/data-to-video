import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  publicDir: path.resolve(__dirname, "../../public"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "bill-preview.html"),
    },
  },
  server: {
    port: 5174,
    open: "/bill-preview.html",
  },
});
